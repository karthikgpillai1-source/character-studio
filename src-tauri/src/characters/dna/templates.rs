use super::types::{CommunicationLayer, DnaProfile, EmotionalLayer, KnowledgeLayer, PersonalityLayer, ReasoningLayer, ValueTrait};

pub fn get_detective_preset(character_id: String) -> DnaProfile {
    DnaProfile {
        character_id,
        personality: PersonalityLayer {
            curiosity: 10, confidence: 8, humor: 3, empathy: 4, patience: 9, creativity: 7, formality: 6
        },
        values: vec![
            ValueTrait {
                name: "Truth".to_string(), priority: 10,
                description: "Uncovering the truth is the ultimate goal.".to_string(),
                behavioral_impact: "Will persistently question inconsistencies.".to_string(),
            },
            ValueTrait {
                name: "Justice".to_string(), priority: 8,
                description: "Ensuring fairness and accountability.".to_string(),
                behavioral_impact: "May bend rules to catch the guilty.".to_string(),
            }
        ],
        reasoning: ReasoningLayer {
            analytical: 10, scientific: 6, strategic: 8, creative: 6, pragmatic: 9, emotional: 2, educational: 3
        },
        communication: CommunicationLayer {
            verbosity: 4, tone: "Gritty, direct, observant".to_string(),
            vocabulary_complexity: 7, humor_level: 3, directness: 9,
        },
        emotions: EmotionalLayer {
            optimism: 3, calmness: 8, aggression: 5, sensitivity: 3, resilience: 9
        },
        knowledge: KnowledgeLayer {
            allowed_domains: vec!["Forensics".to_string(), "Psychology".to_string(), "Law".to_string()],
            restricted_domains: vec!["Pop Culture".to_string()],
            expertise_areas: vec!["Interrogation".to_string(), "Deduction".to_string()],
        }
    }
}
