#include "IntelligenceController.h"
#include "HttpResponse.h"
#include "JsonUtils.h"
#include "EnumUtils.h"

namespace velorent {

IntelligenceController::IntelligenceController(PricingEngine& pricingEngine,
                                                 RecommendationEngine& recommendationEngine,
                                                 VehicleAllocationEngine& allocationEngine,
                                                 VehicleRepository& vehicleRepo,
                                                 CustomerRepository& customerRepo,
                                                 AuthMiddleware& authMiddleware)
    : pricingEngine(pricingEngine), recommendationEngine(recommendationEngine),
      allocationEngine(allocationEngine), vehicleRepo(vehicleRepo),
      customerRepo(customerRepo), authMiddleware(authMiddleware) {}

void IntelligenceController::getPricingQuote(const httplib::Request& req, httplib::Response& res) {
    try {
        auto body = nlohmann::json::parse(req.body);
        int vehicleId = body.at("vehicleId").get<int>();
        std::string startDate = body.at("startDate").get<std::string>();
        std::string endDate = body.at("endDate").get<std::string>();

        double demandFactor = body.value("demandFactor", 1.0);
        std::string tierStr = body.value("loyaltyTier", "BRONZE");
        double surchargePct = body.value("categorySurchargePct", 0.0);

        auto vehicle = vehicleRepo.findById(vehicleId);
        if (!vehicle) {
            HttpResponse::notFound(res, "Vehicle with ID " + std::to_string(vehicleId) + " not found.");
            return;
        }

        LoyaltyTier tier = EnumUtils::stringToLoyaltyTier(tierStr);
        auto breakdown = pricingEngine.calculatePrice(*vehicle, startDate, endDate, demandFactor, tier, surchargePct);

        HttpResponse::success(res, JsonUtils::toJson(breakdown));
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

void IntelligenceController::getRecommendations(const httplib::Request& req, httplib::Response& res) {
    try {
        UserPreferences prefs;

        if (req.method == "POST" && !req.body.empty()) {
            try {
                auto body = nlohmann::json::parse(req.body);
                prefs.maxBudgetPerDay = body.value("maxBudget", 100000.0);
                prefs.targetCategoryId = body.value("categoryId", 0);
                prefs.preferredFuelType = body.value("fuelType", "");
                prefs.preferredTransmission = body.value("transmission", "");
                prefs.minSeats = body.value("seating", 0);
            } catch (...) {}
        } else {
            if (req.has_param("budget")) prefs.maxBudgetPerDay = std::stod(req.get_param_value("budget"));
            if (req.has_param("categoryId")) prefs.targetCategoryId = std::stoi(req.get_param_value("categoryId"));
            if (req.has_param("fuelType")) prefs.preferredFuelType = req.get_param_value("fuelType");
            if (req.has_param("transmission")) prefs.preferredTransmission = req.get_param_value("transmission");
            if (req.has_param("seating")) prefs.minSeats = std::stoi(req.get_param_value("seating"));
        }

        auto fleet = vehicleRepo.findAvailable();
        auto ranked = recommendationEngine.recommendVehicles(fleet, prefs);

        nlohmann::json dataArr = nlohmann::json::array();
        for (const auto& rec : ranked) {
            nlohmann::json item;
            item["vehicle"] = JsonUtils::toJson(*rec.vehicle);
            item["finalScore"] = rec.score.finalScore;
            item["explanation"] = rec.explanation;
            dataArr.push_back(item);
        }

        HttpResponse::collection(res, dataArr);
    } catch (...) {
        throw;
    }
}

void IntelligenceController::allocateVehicle(const httplib::Request& req, httplib::Response& res) {
    try {
        AuthContext auth = authMiddleware.extractAuthContext(req);
        AuthMiddleware::requireAuthenticated(auth);

        UserPreferences prefs;
        if (!req.body.empty()) {
            auto body = nlohmann::json::parse(req.body);
            prefs.targetCategoryId = body.value("categoryId", 0);
            prefs.maxBudgetPerDay = body.value("maxBudget", 100000.0);
        }

        auto candidatePool = vehicleRepo.findAvailable();
        auto result = allocationEngine.allocateVehicle(candidatePool, prefs);

        if (!result.selectedVehicle) {
            HttpResponse::conflict(res, "No matching available vehicle for allocation request.");
            return;
        }

        nlohmann::json resJson;
        resJson["selectedVehicle"] = JsonUtils::toJson(*result.selectedVehicle);
        resJson["allocationScore"] = result.allocationScore;
        resJson["explanation"] = result.explanation;

        HttpResponse::success(res, resJson);
    } catch (const nlohmann::json::exception& ex) {
        HttpResponse::badRequest(res, std::string("JSON error: ") + ex.what());
    } catch (...) {
        throw;
    }
}

} // namespace velorent
