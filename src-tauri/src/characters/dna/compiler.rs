use super::types::DnaProfile;

pub struct DnaCompiler;

impl DnaCompiler {
    pub fn compile(dna: &DnaProfile) -> String {
        let mut prompt = String::new();
        
        prompt.push_str("You are an AI character with the following fundamental DNA structure. Adhere to these instructions strictly.\n\n");

        prompt.push_str("## Personality Traits\n");
        prompt.push_str(&format!("- Curiosity: {}/10\n", dna.personality.curiosity));
        prompt.push_str(&format!("- Confidence: {}/10\n", dna.personality.confidence));
        prompt.push_str(&format!("- Humor: {}/10\n", dna.personality.humor));
        prompt.push_str(&format!("- Empathy: {}/10\n", dna.personality.empathy));
        prompt.push_str(&format!("- Patience: {}/10\n", dna.personality.patience));
        prompt.push_str(&format!("- Creativity: {}/10\n", dna.personality.creativity));
        prompt.push_str(&format!("- Formality: {}/10\n\n", dna.personality.formality));

        if !dna.values.is_empty() {
            prompt.push_str("## Core Values\n");
            for value in &dna.values {
                prompt.push_str(&format!("- **{}** (Priority {}/10): {}\n  Impact: {}\n", 
                    value.name, value.priority, value.description, value.behavioral_impact));
            }
            prompt.push_str("\n");
        }

        prompt.push_str("## Reasoning Profile\n");
        prompt.push_str(&format!("- Analytical: {}/10\n", dna.reasoning.analytical));
        prompt.push_str(&format!("- Scientific: {}/10\n", dna.reasoning.scientific));
        prompt.push_str(&format!("- Strategic: {}/10\n", dna.reasoning.strategic));
        prompt.push_str(&format!("- Creative: {}/10\n", dna.reasoning.creative));
        prompt.push_str(&format!("- Pragmatic: {}/10\n", dna.reasoning.pragmatic));
        prompt.push_str(&format!("- Emotional: {}/10\n", dna.reasoning.emotional));
        prompt.push_str(&format!("- Educational: {}/10\n\n", dna.reasoning.educational));

        prompt.push_str("## Communication Style\n");
        prompt.push_str(&format!("- Tone: {}\n", dna.communication.tone));
        prompt.push_str(&format!("- Verbosity: {}/10\n", dna.communication.verbosity));
        prompt.push_str(&format!("- Vocabulary Complexity: {}/10\n", dna.communication.vocabulary_complexity));
        prompt.push_str(&format!("- Humor Level: {}/10\n", dna.communication.humor_level));
        prompt.push_str(&format!("- Directness: {}/10\n\n", dna.communication.directness));

        prompt.push_str("## Emotional Baseline\n");
        prompt.push_str(&format!("- Optimism: {}/10\n", dna.emotions.optimism));
        prompt.push_str(&format!("- Calmness: {}/10\n", dna.emotions.calmness));
        prompt.push_str(&format!("- Aggression: {}/10\n", dna.emotions.aggression));
        prompt.push_str(&format!("- Sensitivity: {}/10\n", dna.emotions.sensitivity));
        prompt.push_str(&format!("- Resilience: {}/10\n\n", dna.emotions.resilience));

        prompt.push_str("## Knowledge Boundaries\n");
        if !dna.knowledge.expertise_areas.is_empty() {
            prompt.push_str("Expertise:\n");
            for area in &dna.knowledge.expertise_areas {
                prompt.push_str(&format!("- {}\n", area));
            }
        }
        if !dna.knowledge.allowed_domains.is_empty() {
            prompt.push_str("Allowed Domains:\n");
            for domain in &dna.knowledge.allowed_domains {
                prompt.push_str(&format!("- {}\n", domain));
            }
        }
        if !dna.knowledge.restricted_domains.is_empty() {
            prompt.push_str("Restricted Domains (DO NOT ENGAGE):\n");
            for restricted in &dna.knowledge.restricted_domains {
                prompt.push_str(&format!("- {}\n", restricted));
            }
        }
        
        prompt
    }
}
