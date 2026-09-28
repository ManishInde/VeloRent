#include "User.h"
#include "ValidationUtils.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

User::User(int id,
           const std::string& fullName,
           const std::string& email,
           const std::string& passwordHash,
           const std::string& phone,
           UserRole role,
           AccountStatus status,
           const std::string& createdAt)
    : id(id), role(role), status(status), createdAt(createdAt)
{
    setFullName(fullName);
    setEmail(email);
    setPasswordHash(passwordHash);
    setPhone(phone);
}

std::string User::toString() const {
    std::ostringstream ss;
    ss << "User[ID: " << id << ", Name: " << fullName << ", Email: " << email
       << ", Role: " << EnumUtils::toString(role)
       << ", Status: " << EnumUtils::toString(status) << "]";
    return ss.str();
}

void User::setFullName(const std::string& name) {
    ValidationUtils::validateNonEmptyString(name, "Full Name");
    fullName = name;
}

void User::setEmail(const std::string& emailStr) {
    ValidationUtils::validateEmail(emailStr);
    email = emailStr;
}

void User::setPasswordHash(const std::string& hash) {
    ValidationUtils::validateNonEmptyString(hash, "Password Hash");
    passwordHash = hash;
}

void User::setPhone(const std::string& phoneStr) {
    ValidationUtils::validatePhone(phoneStr);
    phone = phoneStr;
}

} // namespace velorent
