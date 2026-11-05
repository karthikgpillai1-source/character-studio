use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DnaProfile {
    pub character_id: String,
    pub personality: PersonalityLayer,
    pub values: Vec<ValueTrait>,
    pub reasoning: ReasoningLayer,
    pub communication: CommunicationLayer,
    pub emotions: EmotionalLayer,
    pub knowledge: KnowledgeLayer,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PersonalityLayer {
    pub curiosity: u8,
    pub confidence: u8,
    pub humor: u8,
    pub empathy: u8,
    pub patience: u8,
    pub creativity: u8,
    pub formality: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValueTrait {
    pub name: String,
    pub priority: u8,
    pub description: String,
    pub behavioral_impact: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReasoningLayer {
    pub analytical: u8,
    pub scientific: u8,
    pub strategic: u8,
    pub creative: u8,
    pub pragmatic: u8,
    pub emotional: u8,
    pub educational: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommunicationLayer {
    pub verbosity: u8,
    pub tone: String,
    pub vocabulary_complexity: u8,
    pub humor_level: u8,
    pub directness: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmotionalLayer {
    pub optimism: u8,
    pub calmness: u8,
    pub aggression: u8,
    pub sensitivity: u8,
    pub resilience: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KnowledgeLayer {
    pub allowed_domains: Vec<String>,
    pub restricted_domains: Vec<String>,
    pub expertise_areas: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DnaScore {
    pub consistency: u8,
    pub complexity: u8,
    pub behavior_coverage: u8,
}
