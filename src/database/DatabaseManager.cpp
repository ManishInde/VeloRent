#include "DatabaseManager.h"
#include "DatabaseException.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include <cstdlib>
#include <regex>

namespace velorent {

DatabaseManager::DatabaseManager()
    : mysqlConn(nullptr), connected(false), inTransaction(false)
{
}

DatabaseManager::~DatabaseManager() {
    disconnect();
}

DatabaseManager& DatabaseManager::getInstance() {
    static DatabaseManager instance;
    return instance;
}

void DatabaseManager::loadConfig(const std::string& configFilePath) {
    std::lock_guard<std::mutex> lock(dbMutex);
    
    // Default configuration values
    config.host = "127.0.0.1";
    config.port = 3306;
    config.name = "velorent";
    config.user = "root";
    config.password = "VeloRent@2026";

    // Attempt to read config file if it exists
    std::ifstream file(configFilePath);
    if (file.is_open()) {
        std::string line;
        std::string content;
        while (std::getline(file, line)) {
            content += line;
        }
        file.close();

        // Extract JSON configuration values
        auto extractVal = [](const std::string& text, const std::string& key) -> std::string {
            size_t pos = text.find("\"" + key + "\"");
            if (pos == std::string::npos) return "";
            size_t colon = text.find(':', pos);
            if (colon == std::string::npos) return "";
            size_t start = text.find_first_of("\"0123456789", colon + 1);
            if (start == std::string::npos) return "";
            if (text[start] == '"') {
                size_t end = text.find('"', start + 1);
                return (end != std::string::npos) ? text.substr(start + 1, end - start - 1) : "";
            } else {
                size_t end = text.find_first_not_of("0123456789", start);
                return (end != std::string::npos) ? text.substr(start, end - start) : text.substr(start);
            }
        };

        std::string h = extractVal(content, "host");
        if (!h.empty()) config.host = h;
        std::string p = extractVal(content, "port");
        if (!p.empty()) config.port = std::stoi(p);
        std::string n = extractVal(content, "name");
        if (!n.empty()) config.name = n;
        std::string u = extractVal(content, "user");
        if (!u.empty()) config.user = u;
        std::string pass = extractVal(content, "password");
        if (!pass.empty()) config.password = pass;
    }

    // Support Environment Variables override for sensitive credentials
    if (const char* envHost = std::getenv("VELORENT_DB_HOST")) config.host = envHost;
    if (const char* envPort = std::getenv("VELORENT_DB_PORT")) config.port = std::stoi(envPort);
    if (const char* envName = std::getenv("VELORENT_DB_NAME")) config.name = envName;
    if (const char* envUser = std::getenv("VELORENT_DB_USER")) config.user = envUser;
    if (const char* envPass = std::getenv("VELORENT_DB_PASS")) config.password = envPass;
}

void DatabaseManager::connect() {
    std::lock_guard<std::mutex> lock(dbMutex);
    if (connected && mysqlConn != nullptr) {
        return;
    }

    mysqlConn = mysql_init(NULL);
    if (!mysqlConn) {
        throw DatabaseException("Failed to initialize MySQL client structure.");
    }

    // Enable multi-statements for procedure execution
    unsigned long flags = CLIENT_MULTI_STATEMENTS | CLIENT_MULTI_RESULTS;

    if (!mysql_real_connect(mysqlConn,
                            config.host.c_str(),
                            config.user.c_str(),
                            config.password.c_str(),
                            config.name.c_str(),
                            config.port,
                            NULL,
                            flags))
    {
        std::string errMsg = mysql_error(mysqlConn);
        unsigned int errNum = mysql_errno(mysqlConn);
        mysql_close(mysqlConn);
        mysqlConn = nullptr;
        connected = false;
        throw DatabaseException(errMsg, errNum);
    }

    // Set charset to utf8mb4
    mysql_set_character_set(mysqlConn, "utf8mb4");
    connected = true;
    inTransaction = false;
}

void DatabaseManager::disconnect() {
    std::lock_guard<std::mutex> lock(dbMutex);
    if (mysqlConn) {
        if (inTransaction) {
            mysql_rollback(mysqlConn);
            inTransaction = false;
        }
        mysql_close(mysqlConn);
        mysqlConn = nullptr;
    }
    connected = false;
}

bool DatabaseManager::ping() {
    std::lock_guard<std::mutex> lock(dbMutex);
    if (!connected || !mysqlConn) return false;
    return (mysql_ping(mysqlConn) == 0);
}

static std::string formatSqlValue(const DbValue& val, MYSQL* conn) {
    return std::visit([conn](auto&& arg) -> std::string {
        using T = std::decay_t<decltype(arg)>;
        if constexpr (std::is_same_v<T, std::nullptr_t>) {
            return "NULL";
        } else if constexpr (std::is_same_v<T, int>) {
            return std::to_string(arg);
        } else if constexpr (std::is_same_v<T, double>) {
            return std::to_string(arg);
        } else if constexpr (std::is_same_v<T, bool>) {
            return arg ? "1" : "0";
        } else if constexpr (std::is_same_v<T, std::string>) {
            // Escapes special characters to prevent SQL injection
            std::string escaped(arg.length() * 2 + 1, '\0');
            unsigned long len = mysql_real_escape_string(conn, &escaped[0], arg.c_str(), static_cast<unsigned long>(arg.length()));
            escaped.resize(len);
            return "'" + escaped + "'";
        }
    }, val);
}

static std::string bindQueryParameters(const std::string& sql, const std::vector<DbValue>& params, MYSQL* conn) {
    std::ostringstream ss;
    size_t paramIdx = 0;
    for (size_t i = 0; i < sql.length(); ++i) {
        if (sql[i] == '?' && paramIdx < params.size()) {
            ss << formatSqlValue(params[paramIdx++], conn);
        } else {
            ss << sql[i];
        }
    }
    return ss.str();
}

ResultSet DatabaseManager::executeQuery(const std::string& sql, const std::vector<DbValue>& params) {
    std::lock_guard<std::mutex> lock(dbMutex);
    if (!isConnected()) connect();

    std::string boundSql = bindQueryParameters(sql, params, mysqlConn);

    if (mysql_query(mysqlConn, boundSql.c_str()) != 0) {
        throw DatabaseException(mysql_error(mysqlConn), mysql_errno(mysqlConn), mysql_sqlstate(mysqlConn));
    }

    MYSQL_RES* res = mysql_store_result(mysqlConn);
    if (!res) {
        if (mysql_field_count(mysqlConn) > 0) {
            throw DatabaseException(mysql_error(mysqlConn), mysql_errno(mysqlConn), mysql_sqlstate(mysqlConn));
        }
        return ResultSet(); // Empty result
    }

    int numFields = mysql_num_fields(res);
    MYSQL_FIELD* fields = mysql_fetch_fields(res);

    ResultSet resultSet;
    MYSQL_ROW row;

    while ((row = mysql_fetch_row(res)) != nullptr) {
        ResultSetRow rRow;
        for (int i = 0; i < numFields; ++i) {
            std::string colName = fields[i].name;
            rRow.addCell(colName, row[i]);
        }
        resultSet.push_back(rRow);
    }

    mysql_free_result(res);

    // Consume extra result sets if multi-query/procedure
    while (mysql_next_result(mysqlConn) == 0) {
        MYSQL_RES* extraRes = mysql_store_result(mysqlConn);
        if (extraRes) mysql_free_result(extraRes);
    }

    return resultSet;
}

uint64_t DatabaseManager::executeUpdate(const std::string& sql, const std::vector<DbValue>& params) {
    std::lock_guard<std::mutex> lock(dbMutex);
    if (!isConnected()) connect();

    std::string boundSql = bindQueryParameters(sql, params, mysqlConn);

    if (mysql_query(mysqlConn, boundSql.c_str()) != 0) {
        throw DatabaseException(mysql_error(mysqlConn), mysql_errno(mysqlConn), mysql_sqlstate(mysqlConn));
    }

    uint64_t affectedRows = mysql_affected_rows(mysqlConn);

    // Clear multi-statement buffers if any
    while (mysql_next_result(mysqlConn) == 0) {
        MYSQL_RES* extraRes = mysql_store_result(mysqlConn);
        if (extraRes) mysql_free_result(extraRes);
    }

    return affectedRows;
}

uint64_t DatabaseManager::executeInsert(const std::string& sql, const std::vector<DbValue>& params) {
    std::lock_guard<std::mutex> lock(dbMutex);
    if (!isConnected()) connect();

    std::string boundSql = bindQueryParameters(sql, params, mysqlConn);

    if (mysql_query(mysqlConn, boundSql.c_str()) != 0) {
        throw DatabaseException(mysql_error(mysqlConn), mysql_errno(mysqlConn), mysql_sqlstate(mysqlConn));
    }

    uint64_t lastId = mysql_insert_id(mysqlConn);

    // Clear multi-statement buffers
    while (mysql_next_result(mysqlConn) == 0) {
        MYSQL_RES* extraRes = mysql_store_result(mysqlConn);
        if (extraRes) mysql_free_result(extraRes);
    }

    return lastId;
}

ResultSet DatabaseManager::executeProcedure(const std::string& sql, const std::vector<DbValue>& params) {
    return executeQuery(sql, params);
}

void DatabaseManager::beginTransaction() {
    std::lock_guard<std::mutex> lock(dbMutex);
    if (!isConnected()) connect();

    if (mysql_query(mysqlConn, "START TRANSACTION") != 0) {
        throw DatabaseException(mysql_error(mysqlConn), mysql_errno(mysqlConn), mysql_sqlstate(mysqlConn));
    }
    inTransaction = true;
}

void DatabaseManager::commit() {
    std::lock_guard<std::mutex> lock(dbMutex);
    if (!isConnected() || !inTransaction) return;

    if (mysql_query(mysqlConn, "COMMIT") != 0) {
        throw DatabaseException(mysql_error(mysqlConn), mysql_errno(mysqlConn), mysql_sqlstate(mysqlConn));
    }
    inTransaction = false;
}

void DatabaseManager::rollback() {
    std::lock_guard<std::mutex> lock(dbMutex);
    if (!isConnected() || !inTransaction) return;

    mysql_query(mysqlConn, "ROLLBACK");
    inTransaction = false;
}

} // namespace velorent
