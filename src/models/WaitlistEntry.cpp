#include "WaitlistEntry.h"
#include "ValidationUtils.h"
#include "ValidationException.h"
#include "DateUtils.h"
#include "EnumUtils.h"
#include <sstream>

namespace velorent {

WaitlistEntry::WaitlistEntry(int id,
                             int customerId,
                             int vehicleId,
                             const std::string& requestedStart,
                             const std::string& requestedEnd,
                             WaitlistStatus status,
                             const std::string& notifiedAt,
                             const std::string& queuedAt)
    : id(id), customerId(customerId), vehicleId(vehicleId),
      requestedStart(requestedStart), requestedEnd(requestedEnd),
      status(status), notifiedAt(notifiedAt), queuedAt(queuedAt)
{
    if (!DateUtils::isBefore(requestedStart, requestedEnd)) {
        throw ValidationException("Waitlist requested end date must be after requested start date.");
    }
}

std::string WaitlistEntry::toString() const {
    std::ostringstream ss;
    ss << "WaitlistEntry[ID: " << id << ", CustomerID: " << customerId
       << ", VehicleID: " << vehicleId
       << ", Dates: " << requestedStart << " to " << requestedEnd
       << ", Status: " << EnumUtils::toString(status) << "]";
    return ss.str();
}

void WaitlistEntry::markNotified(const std::string& timestamp) {
    notifiedAt = timestamp;
    status = WaitlistStatus::NOTIFIED;
}

} // namespace velorent
