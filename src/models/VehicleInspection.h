#pragma once
#include "IEntity.h"
#include <string>

namespace velorent {

/**
 * @brief Represents a physical vehicle inspection report.
 */
class VehicleInspection : public IEntity {
private:
    int inspectionId;
    int vehicleId;
    int inspectorId;
    std::string inspectionDate;
    double score;
    std::string notes;
    bool passed;

public:
    VehicleInspection(int inspectionId,
                      int vehicleId,
                      int inspectorId,
                      const std::string& inspectionDate,
                      double score,
                      const std::string& notes = "",
                      bool passed = true);

    int getId() const override { return inspectionId; }
    std::string toString() const override;

    int getVehicleId() const { return vehicleId; }
    int getInspectorId() const { return inspectorId; }
    const std::string& getInspectionDate() const { return inspectionDate; }
    double getScore() const { return score; }
    const std::string& getNotes() const { return notes; }
    bool isPassed() const { return passed; }

    void setScore(double s);
    void setNotes(const std::string& n) { notes = n; }
    void setPassed(bool p) { passed = p; }
};

} // namespace velorent
