#pragma once
#include "Customer.h"
#include "DatabaseManager.h"
#include <memory>
#include <vector>

namespace velorent {

class CustomerRepository {
private:
    DatabaseManager& db;

public:
    explicit CustomerRepository(DatabaseManager& dbManager = DatabaseManager::getInstance());

    std::shared_ptr<Customer> findById(int customerId);
    std::shared_ptr<Customer> findByEmail(const std::string& email);
    std::vector<std::shared_ptr<Customer>> findAll();

    int save(Customer& customer);
    bool update(const Customer& customer);
};

} // namespace velorent
