#include "Review.h"
#include "ValidationUtils.h"
#include <sstream>

namespace velorent {

Review::Review(int id,
               int rentalId,
               int customerId,
               int vehicleId,
               int rating,
               const std::string& comment,
               const std::string& createdAt)
    : id(id), rentalId(rentalId), customerId(customerId),
      vehicleId(vehicleId), comment(comment), createdAt(createdAt)
{
    setRating(rating);
}

std::string Review::toString() const {
    std::ostringstream ss;
    ss << "Review[ID: " << id << ", CustomerID: " << customerId
       << ", VehicleID: " << vehicleId
       << ", Rating: " << rating << "/5, Comment: " << comment << "]";
    return ss.str();
}

void Review::setRating(int r) {
    ValidationUtils::validateRating(r);
    rating = r;
}

} // namespace velorent
