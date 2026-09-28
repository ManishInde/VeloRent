#include "UserRepository.h"
#include "RowMappers.h"
#include "NotFoundException.h"

namespace velorent {

UserRepository::UserRepository(DatabaseManager& dbManager)
    : db(dbManager)
{
}

std::shared_ptr<User> UserRepository::findById(int userId) {
    std::string sql = "SELECT * FROM users WHERE user_id = ?";
    ResultSet rs = db.executeQuery(sql, {userId});
    if (rs.empty()) {
        throw NotFoundException("User with ID " + std::to_string(userId) + " not found.");
    }
    return RowMappers::mapUser(rs[0]);
}

std::shared_ptr<User> UserRepository::findByEmail(const std::string& email) {
    std::string sql = "SELECT * FROM users WHERE email = ?";
    ResultSet rs = db.executeQuery(sql, {email});
    if (rs.empty()) {
        throw NotFoundException("User with email " + email + " not found.");
    }
    return RowMappers::mapUser(rs[0]);
}

std::vector<std::shared_ptr<User>> UserRepository::findAll() {
    std::string sql = "SELECT * FROM users ORDER BY user_id ASC";
    ResultSet rs = db.executeQuery(sql);
    std::vector<std::shared_ptr<User>> list;
    for (const auto& row : rs) {
        auto user = RowMappers::mapUser(row);
        if (user) list.push_back(user);
    }
    return list;
}

bool UserRepository::updatePasswordHash(int userId, const std::string& newHash) {
    std::string sql = "UPDATE users SET password_hash = ? WHERE user_id = ?";
    uint64_t rows = db.executeUpdate(sql, {newHash, userId});
    return rows > 0;
}

bool UserRepository::updateStatus(int userId, AccountStatus status) {
    bool active = (status == AccountStatus::ACTIVE);
    std::string sql = "UPDATE users SET is_active = ? WHERE user_id = ?";
    uint64_t rows = db.executeUpdate(sql, {active, userId});
    return rows > 0;
}

} // namespace velorent
