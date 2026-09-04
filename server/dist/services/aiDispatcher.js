"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiSmartDispatcher = exports.AISmartDispatcherService = void 0;
class AISmartDispatcherService {
    // Simulates or calculates realistic live traffic congestion index for each corridor
    estimateTraffic(hub, distanceKm) {
        const hour = new Date().getHours();
        const isPeakHour = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
        // Office tech parks and major railway stations have heavier surrounding traffic during peak hours
        if (isPeakHour && (hub.category === 'office' || hub.category === 'railway')) {
            return { level: 'Heavy', delayMinutes: Math.round(distanceKm * 3.5), penalty: 25 };
        }
        else if (isPeakHour || hub.demandLevel === 'SURGE') {
            return { level: 'Moderate', delayMinutes: Math.round(distanceKm * 2.2), penalty: 12 };
        }
        else {
            return { level: 'Low', delayMinutes: Math.round(distanceKm * 1.2), penalty: 4 };
        }
    }
    // Parse estimated fare potential numeric value from string (e.g., "₹80 - ₹250" -> 165)
    parseFareScore(fareString) {
        const numbers = fareString.match(/\d+/g);
        if (!numbers || numbers.length === 0)
            return 50;
        if (numbers.length === 1)
            return parseInt(numbers[0], 10);
        const avg = (parseInt(numbers[0], 10) + parseInt(numbers[1], 10)) / 2;
        // Scale avg fare (₹30 to ₹250) into a 0-100 score
        return Math.min(100, Math.max(10, (avg / 200) * 100));
    }
    /**
     * AI Multi-Objective Scoring Algorithm:
     * Net Score = (w_demand * DemandScore) + (w_fare * FareScore) - (w_dist * DistancePenalty) - (w_traffic * TrafficPenalty)
     */
    generateSuggestions(hubs, options) {
        const { driverLocation, priorityPreference = 'balanced', maxDistanceKm = 8.0 } = options;
        let wDemand = 0.35;
        let wFare = 0.25;
        let wDistance = 0.20;
        let wTraffic = 0.20;
        if (priorityPreference === 'highest_fare') {
            wFare = 0.50;
            wDemand = 0.25;
            wDistance = 0.15;
            wTraffic = 0.10;
        }
        else if (priorityPreference === 'least_traffic') {
            wTraffic = 0.45;
            wDistance = 0.25;
            wDemand = 0.20;
            wFare = 0.10;
        }
        else if (priorityPreference === 'fastest_pickup') {
            wDistance = 0.40;
            wDemand = 0.35;
            wTraffic = 0.15;
            wFare = 0.10;
        }
        const scoredHubs = hubs.map((hub) => {
            // Calculate Haversine distance
            const R = 6371;
            const dLat = ((hub.location.lat - driverLocation.lat) * Math.PI) / 180;
            const dLng = ((hub.location.lng - driverLocation.lng) * Math.PI) / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((driverLocation.lat * Math.PI) / 180) *
                    Math.cos((hub.location.lat * Math.PI) / 180) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceKm = Math.round(R * c * 10) / 10;
            const traffic = this.estimateTraffic(hub, distanceKm);
            const fareScore = this.parseFareScore(hub.avgFareEstimate);
            const distancePenalty = Math.min(100, (distanceKm / maxDistanceKm) * 80);
            // Composite AI Net Score Calculation
            const rawScore = hub.currentDemand * wDemand +
                fareScore * wFare -
                distancePenalty * wDistance -
                traffic.penalty * wTraffic;
            const netScore = Math.max(5, Math.min(99, Math.round(rawScore)));
            // Generate natural language reasoning
            let recommendationReason = '';
            let hindiVoiceReason = '';
            if (hub.demandLevel === 'SURGE' && traffic.level !== 'Heavy') {
                recommendationReason = `🔥 Top Match: Surge crowd (${hub.activePassengerPings} waiting), fast route with low congestion.`;
                hindiVoiceReason = `बेस्ट पिकअप: ${hub.name} पर भारी भीड़ है और रास्ता एकदम खुला है।`;
            }
            else if (priorityPreference === 'highest_fare' || fareScore > 70) {
                recommendationReason = `💰 High Earning Potential (${hub.avgFareEstimate}), ideal for return long trips.`;
                hindiVoiceReason = `ज्यादा कमाई: ${hub.name} से लंबी दूरी और अच्छे किराए की सवारियां मिल रही हैं।`;
            }
            else if (traffic.level === 'Low') {
                recommendationReason = `🟢 Clear Corridor: Zero traffic signal delay, immediate passenger boarding (<${hub.estimatedWaitMinutes}m).`;
                hindiVoiceReason = `ग्रीन रूट: ${hub.name} का रास्ता साफ है, सिर्फ ${distanceKm} किलोमीटर दूर।`;
            }
            else {
                recommendationReason = `⚡ Steady demand (${hub.activePassengerPings} people), ${distanceKm} km away.`;
                hindiVoiceReason = `${hub.name} की तरफ जाएं, तुरंत सवारी मिलेगी।`;
            }
            return {
                hubId: hub.id,
                hubName: hub.name,
                category: hub.category,
                demandScore: hub.currentDemand,
                demandLevel: hub.demandLevel,
                distanceKm,
                estimatedWaitMinutes: hub.estimatedWaitMinutes,
                avgFareEstimate: hub.avgFareEstimate,
                trafficLevel: traffic.level,
                trafficDelayMinutes: traffic.delayMinutes,
                netScore,
                recommendationReason,
                hindiVoiceReason,
                actionGuidance: `Head ${distanceKm} km towards ${hub.name}. Estimated fare ${hub.avgFareEstimate}.`,
            };
        });
        // Rank descending by AI Net Score
        scoredHubs.sort((a, b) => b.netScore - a.netScore);
        return scoredHubs;
    }
}
exports.AISmartDispatcherService = AISmartDispatcherService;
exports.aiSmartDispatcher = new AISmartDispatcherService();
