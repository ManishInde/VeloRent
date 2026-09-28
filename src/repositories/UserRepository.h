#pragma once
#include "User.h"
#include "DatabaseManager.h"
#include <memory>
#include <vector>
#include <string>

namespace velorent {

class UserRepository {
private:
    DatabaseManager& db;

public:
    explicit UserRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    std::shared_ptr<User> findById(int userId);
    std::shared_ptr<User> findByEmail(const std::string& email);
    std::vector<std::shared_ptr<User>> findAll();

    bool updatePasswordHash(int userId, const std::string& newHash);
    bool updateStatus(int userId, AccountStatus status);
};

} // namespace velorent
