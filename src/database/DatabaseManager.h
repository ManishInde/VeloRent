#pragma once
#include <string>
#include <vector>
#include <map>
#include <variant>
#include <memory>
#include <mutex>
#include <mysql.h>

namespace velorent {

/**
 * @brief Variant type for prepared statement parameter binding.
 */
using DbValue = std::variant<std::nullptr_t, int, double, std::string, bool>;

/**
 * @brief Represents a single row returned from a database query.
 */
class ResultSetRow {
private:
    std::map<std::string, std::string> data;
    std::map<std::string, bool> nullFlags;

public:
    ResultSetRow() = default;

    void addCell(const std::string& columnName, const char* value) {
        if (value == nullptr) {
            data[columnName] = "";
            nullFlags[columnName] = true;
        } else {
            data[columnName] = std::string(value);
            nullFlags[columnName] = false;
        }
    }

    bool isNull(const std::string& columnName) const {
        auto it = nullFlags.find(columnName);
        if (it != nullFlags.end()) return it->second;
        return true;
    }

    std::string getString(const std::string& columnName, const std::string& defaultVal = "") const {
        if (isNull(columnName)) return defaultVal;
        auto it = data.find(columnName);
        return (it != data.end()) ? it->second : defaultVal;
    }

    int getInt(const std::string& columnName, int defaultVal = 0) const {
        if (isNull(columnName)) return defaultVal;
        std::string s = getString(columnName);
        if (s.empty()) return defaultVal;
        return std::stoi(s);
    }

    double getDouble(const std::string& columnName, double defaultVal = 0.0) const {
        if (isNull(columnName)) return defaultVal;
        std::string s = getString(columnName);
        if (s.empty()) return defaultVal;
        return std::stod(s);
    }

    bool getBool(const std::string& columnName, bool defaultVal = false) const {
        if (isNull(columnName)) return defaultVal;
        std::string s = getString(columnName);
        if (s == "1" || s == "true" || s == "TRUE") return true;
        if (s == "0" || s == "false" || s == "FALSE") return false;
        return defaultVal;
    }
};

using ResultSet = std::vector<ResultSetRow>;

struct DatabaseConfig {
    std::string host = "127.0.0.1";
    unsigned int port = 3306;
    std::string name = "velorent";
    std::string user = "root";
    std::string password = "";
};

/**
 * @brief Core Database Infrastructure Manager.
 * Responsibilities:
 * - MySQL connection lifecycle management
 * - Configuration loading from config.json or environment variables
 * - Prepared statement execution & parameter binding
 * - Transaction control (beginTransaction, commit, rollback)
 * - Thread-safe connection operations
 * Note: DatabaseManager contains ZERO business logic.
 */
class DatabaseManager {
private:
    MYSQL* mysqlConn;
    DatabaseConfig config;
    bool connected;
    bool inTransaction;
    std::mutex dbMutex;

    DatabaseManager();
    ~DatabaseManager();

    // Prevent copying
    DatabaseManager(const DatabaseManager&) = delete;
    DatabaseManager& operator=(const DatabaseManager&) = delete;

public:
    static DatabaseManager& getInstance();

    /**
     * @brief Load connection configuration from config.json or environment variables.
     */
    void loadConfig(const std::string& configFilePath = "config/config.json");

    /**
     * @brief Open connection to MySQL server.
     */
    void connect();

    /**
     * @brief Close active MySQL connection cleanly.
     */
    void disconnect();

    /**
     * @brief Check if database connection is alive.
     */
    bool isConnected() const { return connected && mysqlConn != nullptr; }

    /**
     * @brief Ping database server.
     */
    bool ping();

    /**
     * @brief Execute a parameterized query (SELECT).
     */
    ResultSet executeQuery(const std::string& sql, const std::vector<DbValue>& params = {});

    /**
     * @brief Execute a parameterized modification statement (INSERT, UPDATE, DELETE).
     * @return Number of affected rows.
     */
    uint64_t executeUpdate(const std::string& sql, const std::vector<DbValue>& params = {});

    /**
     * @brief Execute a statement and return last AUTO_INCREMENT insert ID.
     */
    uint64_t executeInsert(const std::string& sql, const std::vector<DbValue>& params = {});

    /**
     * @brief Execute a stored procedure (CALL sp_name(...)).
     */
    ResultSet executeProcedure(const std::string& sql, const std::vector<DbValue>& params = {});

    // Transaction Management
    void beginTransaction();
    void commit();
    void rollback();
    bool isInTransaction() const { return inTransaction; }

    const DatabaseConfig& getConfig() const { return config; }
};

/**
 * @brief RAII Transaction Guard for automatic rollback on exception.
 */
class TransactionGuard {
private:
    DatabaseManager& db;
    bool committed;

public:
    explicit TransactionGuard(DatabaseManager& dbManager = DatabaseManager::getInstance())
        : db(dbManager), committed(false)
    {
        db.beginTransaction();
    }

    ~TransactionGuard() {
        if (!committed && db.isInTransaction()) {
            try {
                db.rollback();
            } catch (...) {}
        }
    }

    void commit() {
        db.commit();
        committed = true;
    }
};

} // namespace velorent
