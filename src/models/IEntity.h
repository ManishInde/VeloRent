#pragma once
#include <string>

namespace velorent {

/**
 * @brief Base interface for all persistent domain entities in VeloRent.
 * Demonstrates Abstraction & Interface Inheritance in C++.
 */
class IEntity {
public:
    virtual ~IEntity() = default;

    /**
     * @brief Get unique surrogate database primary key ID.
     */
    virtual int getId() const = 0;

    /**
     * @brief Printable string summary of the entity.
     */
    virtual std::string toString() const = 0;
};

} // namespace velorent
