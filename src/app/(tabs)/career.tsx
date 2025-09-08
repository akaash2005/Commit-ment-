import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';

const Career = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const getCareerRoadmap = async () => {
    if (!input) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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",
        },
        body: JSON.stringify({
          model: "chatgpt-oss-120b",
          messages: [
            {
              role: "system",
              content: `You are a career mentor. Always respond ONLY in valid JSON with these keys:
              {
                "career_path": [ "Step 1", "Step 2" ],
                "recommended_courses_skills": [ "Course/Skill 1" ],
                "scholarships_mentorships": [ "Scholarship/Mentor" ],
                "timeline_milestones": [ "Year 1 milestone", "Year 2 milestone" ]
              }`
            },
            { role: "user", content: input },
          ],
          max_tokens: 600,
        }),
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '{}';
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        parsed = { error: 'Invalid JSON received', raw: text };
      }
      setResult(parsed);
    } catch (err) {
      console.error(err);
      setResult({ error: 'Error fetching roadmap.' });
    }

    setLoading(false);
  };

  const renderList = (title: string, items: string[]) => (
    <View style={{ marginBottom: 15 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>{title}</Text>
      {items.map((item, index) => (
        <Text key={index} style={{ fontSize: 16, marginLeft: 10 }}>• {item}</Text>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>AI Mentor Twin 🚀</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8 }}
        placeholder="Type your career dream + current status"
        value={input}
        onChangeText={setInput}
      />
      <Button title={loading ? 'Loading...' : 'Get Roadmap'} onPress={getCareerRoadmap} disabled={loading} />
      <ScrollView style={{ marginTop: 20 }}>
        {result && result.error && (
          <Text style={{ fontSize: 16, color: 'red' }}>{result.error}</Text>
        )}
        {result && !result.error && (
          <View>
            {result.career_path && renderList('Career Path', result.career_path)}
            {result.recommended_courses_skills && renderList('Recommended Courses & Skills', result.recommended_courses_skills)}
            {result.scholarships_mentorships && renderList('Scholarships & Mentorships', result.scholarships_mentorships)}
            {result.timeline_milestones && renderList('Timeline & Milestones', result.timeline_milestones)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Career;