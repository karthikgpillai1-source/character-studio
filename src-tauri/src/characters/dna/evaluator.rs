use super::types::{DnaProfile, DnaScore};
use std::cmp;

pub struct DnaEvaluator;

impl DnaEvaluator {
    pub fn evaluate(dna: &DnaProfile) -> DnaScore {
        let mut consistency = 100i32;
        
        // Basic heuristics for consistency penalties
        
        // High aggression + High calmness = Contradiction
        if dna.emotions.aggression > 7 && dna.emotions.calmness > 7 {
            consistency -= 20;
        }
        
        // High verbosity + Extreme directness = slight friction
        if dna.communication.verbosity > 8 && dna.communication.directness > 8 {
            consistency -= 10;
        }
        
        // Scientific reasoning + Highly emotional reasoning
        if dna.reasoning.scientific > 8 && dna.reasoning.emotional > 8 {
            consistency -= 15;
        }

        // Behavior coverage (how much of the DNA is actually defined vs defaulted to 0)
        let mut coverage_points = 0;
        if dna.values.len() >= 3 { coverage_points += 40; } else { coverage_points += (dna.values.len() * 10) as i32; }
        if !dna.knowledge.expertise_areas.is_empty() { coverage_points += 30; }
        if dna.communication.tone.len() > 5 { coverage_points += 30; }

        DnaScore {
            consistency: cmp::max(0, consistency) as u8,
            complexity: 85, // Mocked complexity metric
            behavior_coverage: cmp::min(100, coverage_points) as u8,
        }
    }
}
