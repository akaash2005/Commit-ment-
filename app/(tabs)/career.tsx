import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const GEMINI_API_KEY = 'AIzaSyBU66oGdzHauNYahWTaFFJ_sKV7POibyGY';

interface CareerStep {
  phase: string;
  duration: string;
  actions: string[];
  skills: string[];
  resources: string[];
}

interface CareerPathway {
  title: string;
  overview: string;
  timeline: string;
  steps: CareerStep[];
  mentors: string[];
  opportunities: string[];
  milestones: string[];
}

const Career: React.FC = () => {


  const [currentStatus, setCurrentStatus] = useState('');
  const [careerDream, setCareerDream] = useState('');
  const [location, setLocation] = useState('');
  const [pathway, setPathway] = useState<CareerPathway | null>(null);
  const [loading, setLoading] = useState(false);

  const generateCareerPathway = async () => {
    if (!currentStatus.trim() || !careerDream.trim()) {
      Alert.alert('Missing Information', 'Please fill in both your current status and career dream');
      return;
    }

    setLoading(true);

    const prompt = `You are an AI career mentor for girls and underprivileged youth.

Student Profile:
- Career Dream: ${careerDream}
- Current Status: ${currentStatus}
- Location: ${location || 'Not specified'}

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "title": "Career pathway title",
  "overview": "2-3 sentence inspiring overview",
  "timeline": "Total estimated timeline",
  "steps": [
    {
      "phase": "Foundation Building",
      "duration": "3-6 months",
      "actions": ["Specific action 1", "Specific action 2", "Specific action 3"],
      "skills": ["Key skill 1", "Key skill 2", "Key skill 3"],
      "resources": ["Free resource 1", "Scholarship program", "Online course"]
    }
  ],
  "mentors": ["Type of mentor 1", "Type of mentor 2", "Industry professional"],
  "opportunities": ["Internship opportunity", "Volunteer work", "Project idea"],
  "milestones": ["Month 3: First milestone", "Month 6: Second milestone", "Year 1: Major milestone"]
}

Focus on FREE resources and opportunities for girls/underprivileged youth.`;

    try {
      console.log('Sending request to Gemini API...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content.parts[0].text;
        console.log('Generated content:', content);
        
        try {
          // Try to parse the content directly first
          let pathwayData;
          try {
            pathwayData = JSON.parse(content);
          } catch (e) {
            // If direct parsing fails, try to extract JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              pathwayData = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No valid JSON found in response');
            }
          }
          
          // Validate the structure
          if (!pathwayData.title || !pathwayData.steps || !Array.isArray(pathwayData.steps)) {
            throw new Error('Invalid pathway structure received');
          }
          
          setPathway(pathwayData);
          
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.error('Content that failed to parse:', content);
          
          // Fallback: Create a basic pathway
          const fallbackPathway = {
            title: `Your Path to ${careerDream}`,
            overview: "Let's create a personalized pathway to achieve your career dreams step by step!",
            timeline: "12-24 months",
            steps: [{
              phase: "Getting Started",
              duration: "3 months",
              actions: ["Research your field", "Identify required skills", "Create a learning plan"],
              skills: ["Research", "Planning", "Goal Setting"],
              resources: ["Online courses", "Library resources", "Career websites"]
            }],
            mentors: ["Industry professionals", "Career counselors", "Online communities"],
            opportunities: ["Volunteer work", "Online projects", "Local networking events"],
            milestones: ["Month 1: Research complete", "Month 3: First project", "Month 6: Skills assessment"]
          };
          
          setPathway(fallbackPathway);
          Alert.alert('Notice', 'Using a basic pathway template. Please try again for a more personalized result.');
        }
      } else if (data.error) {
        console.error('API Error:', data.error);
        throw new Error(data.error.message || 'API returned an error');
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Full Error:', error);
      Alert.alert(
        'Connection Error', 
        `Failed to generate career pathway: ${error.message}. Please check your internet connection and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStatus('');
    setCareerDream('');
    setLocation('');
    setPathway(null);
  };

  const renderPathway = () => {
    if (!pathway) return null;

    return (
      <ScrollView style={styles.pathwayContainer}>
        <View style={styles.pathwayHeader}>
          <Text style={styles.pathwayTitle}>{pathway.title}</Text>
          <Text style={styles.pathwayOverview}>{pathway.overview}</Text>
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineLabel}>Timeline:</Text>
            <Text style={styles.timelineText}>{pathway.timeline}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Your Learning Journey</Text>
          {pathway.steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepPhase}>{step.phase}</Text>
                <Text style={styles.stepDuration}>{step.duration}</Text>
              </View>
              
              <View style={styles.stepContent}>
                <Text style={styles.stepSubtitle}>Actions to Take:</Text>
                {step.actions.map((action, i) => (
                  <Text key={i} style={styles.bulletPoint}>• {action}</Text>
                ))}
                
                <Text style={styles.stepSubtitle}>Skills to Develop:</Text>
                <View style={styles.skillsContainer}>
                  {step.skills.map((skill, i) => (
                    <View key={i} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={styles.stepSubtitle}>Resources:</Text>
                {step.resources.map((resource, i) => (
                  <Text key={i} style={styles.resourcePoint}>🔗 {resource}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Find Your Mentors</Text>
          <View style={styles.listContainer}>
            {pathway.mentors.map((mentor, index) => (
              <Text key={index} style={styles.listItem}>• {mentor}</Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Opportunities to Explore</Text>
          <View style={styles.listContainer}>
            {pathway.opportunities.map((opportunity, index) => (
              <Text key={index} style={styles.opportunityItem}>🚀 {opportunity}</Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Track Your Milestones</Text>
          <View style={styles.milestonesContainer}>
            {pathway.milestones.map((milestone, index) => (
              <View key={index} style={styles.milestoneItem}>
                <View style={styles.milestoneCircle}>
                  <Text style={styles.milestoneNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.milestoneText}>{milestone}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.newPathwayButton} onPress={resetForm}>
          <Text style={styles.newPathwayText}>Create New Pathway</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  if (pathway) {
    return (
      <SafeAreaView style={styles.container}>
        {renderPathway()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Mentor Twin 🚀</Text>
          <Text style={styles.subtitle}>Your personalized career guidance</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>What's your career dream? ✨</Text>
          <TextInput
            style={styles.input}
            value={careerDream}
            onChangeText={setCareerDream}
            placeholder="e.g., I want to become a software engineer, doctor, entrepreneur..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tell me about your current situation 📍</Text>
          <TextInput
            style={styles.input}
            value={currentStatus}
            onChangeText={setCurrentStatus}
            placeholder="e.g., I'm in 10th grade, I just graduated, I'm changing careers..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your location (optional) 🌍</Text>
          <TextInput
            style={styles.smallInput}
            value={location}
            onChangeText={setLocation}
            placeholder="City, State/Country"
          />
        </View>

        <TouchableOpacity 
          style={[styles.generateButton, loading && styles.disabledButton]} 
          onPress={generateCareerPathway}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.buttonText}>Creating your pathway...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Generate My Career Pathway 🎯</Text>
          )}
        </TouchableOpacity>

        <View style={styles.inspirationBox}>
          <Text style={styles.inspirationText}>
            💪 Every successful person started exactly where you are now. Your dreams are valid and achievable!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    minHeight: 80,
  },
  smallInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    height: 50,
  },
  generateButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inspirationBox: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  inspirationText: {
    fontSize: 14,
    color: '#27ae60',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  pathwayContainer: {
    flex: 1,
    padding: 20,
  },
  pathwayHeader: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pathwayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  pathwayOverview: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
    marginBottom: 15,
    textAlign: 'center',
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 10,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginRight: 5,
  },
  timelineText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  stepContainer: {
    marginBottom: 25,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
    paddingLeft: 15,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepPhase: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  stepDuration: {
    fontSize: 14,
    color: '#7f8c8d',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stepContent: {
    marginTop: 10,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginTop: 15,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
    marginLeft: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  skillTag: {
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 3,
  },
  skillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  resourcePoint: {
    fontSize: 14,
    color: '#27ae60',
    marginBottom: 5,
    marginLeft: 10,
  },
  listContainer: {
    marginTop: 10,
  },
  listItem: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    marginLeft: 10,
  },
  opportunityItem: {
    fontSize: 16,
    color: '#e67e22',
    marginBottom: 8,
    marginLeft: 10,
    fontWeight: '500',
  },
  milestonesContainer: {
    marginTop: 10,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  milestoneCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  milestoneNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  milestoneText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
    lineHeight: 22,
  },
  newPathwayButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  newPathwayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Career;