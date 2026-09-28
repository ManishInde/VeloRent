#include "CustomerRepository.h"
#include "RowMappers.h"
#include "EnumUtils.h"
#include "NotFoundException.h"

namespace velorent {

CustomerRepository::CustomerRepository(DatabaseManager& dbManager)
    : db(dbManager)
{
}

std::shared_ptr<Customer> CustomerRepository::findById(int customerId) {
    std::string sql = "SELECT u.*, c.driving_licence_no, c.licence_expiry, c.risk_score FROM users u JOIN customers c ON u.user_id = c.customer_id WHERE u.user_id = ?";
    ResultSet rs = db.executeQuery(sql, {customerId});
    if (rs.empty()) {
        throw NotFoundException("Customer with ID " + std::to_string(customerId) + " not found.");
    }
    return RowMappers::mapCustomer(rs[0]);
}

std::shared_ptr<Customer> CustomerRepository::findByEmail(const std::string& email) {
    std::string sql = "SELECT u.*, c.driving_licence_no, c.licence_expiry, c.risk_score FROM users u JOIN customers c ON u.user_id = c.customer_id WHERE u.email = ?";
    ResultSet rs = db.executeQuery(sql, {email});
    if (rs.empty()) {
        throw NotFoundException("Customer with email " + email + " not found.");
    }
    return RowMappers::mapCustomer(rs[0]);
}

std::vector<std::shared_ptr<Customer>> CustomerRepository::findAll() {
    std::string sql = "SELECT u.*, c.driving_licence_no, c.licence_expiry, c.risk_score FROM users u JOIN customers c ON u.user_id = c.customer_id ORDER BY u.user_id ASC";
    ResultSet rs = db.executeQuery(sql);
    std::vector<std::shared_ptr<Customer>> list;
    for (const auto& row : rs) {
        list.push_back(RowMappers::mapCustomer(row));
    }
    return list;
}

int CustomerRepository::save(Customer& customer) {
    TransactionGuard guard(db);

    bool isActive = (customer.getStatus() == AccountStatus::ACTIVE);
    std::string sqlUser = "INSERT INTO users (full_name, email, password_hash, phone, role, is_active) VALUES (?, ?, ?, ?, 'CUSTOMER', ?)";
    uint64_t userId = db.executeInsert(sqlUser, {
        customer.getFullName(),
        customer.getEmail(),
        customer.getPasswordHash(),
        customer.getPhone(),
        isActive
    });

    std::string sqlCust = "INSERT INTO customers (customer_id, driving_licence_no, licence_expiry, risk_score) VALUES (?, ?, ?, ?)";
    db.executeUpdate(sqlCust, {
        static_cast<int>(userId),
        customer.getDrivingLicenseNumber(),
        customer.getLicenseExpiry().empty() ? DbValue(nullptr) : DbValue(customer.getLicenseExpiry()),
        customer.getRiskScore()
    });

    // Also initialize loyalty account for new customer
    std::string sqlLoyalty = "INSERT INTO loyalty_accounts (customer_id, points_balance, total_points_earned, tier) VALUES (?, 0, 0, 'BRONZE')";
    db.executeUpdate(sqlLoyalty, {static_cast<int>(userId)});

    guard.commit();
    return static_cast<int>(userId);
}

bool CustomerRepository::update(const Customer& customer) {
    TransactionGuard guard(db);

    bool isActive = (customer.getStatus() == AccountStatus::ACTIVE);
    std::string sqlUser = "UPDATE users SET full_name = ?, email = ?, password_hash = ?, phone = ?, is_active = ? WHERE user_id = ?";
    uint64_t rows1 = db.executeUpdate(sqlUser, {
        customer.getFullName(),
        customer.getEmail(),
        customer.getPasswordHash(),
        customer.getPhone(),
        isActive,
        customer.getId()
    });

    std::string sqlCust = "UPDATE customers SET driving_licence_no = ?, licence_expiry = ?, risk_score = ? WHERE customer_id = ?";
    uint64_t rows2 = db.executeUpdate(sqlCust, {
        customer.getDrivingLicenseNumber(),
        customer.getLicenseExpiry().empty() ? DbValue(nullptr) : DbValue(customer.getLicenseExpiry()),
        customer.getRiskScore(),
        customer.getId()
    });

    guard.commit();
    return (rows1 > 0 || rows2 > 0);
}

} // namespace velorent
