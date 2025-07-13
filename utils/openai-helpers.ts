import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Converts an image URI to base64 format
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    // Handle web platform differently
    if (Platform.OS === 'web') {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          const reader = new FileReader();
          reader.onloadend = function() {
            if (typeof reader.result === 'string') {
              resolve(reader.result.split(',')[1]);
            } else {
              reject(new Error('Failed to convert image to base64'));
            }
          };
          reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = reject;
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
    }
    
    // For native platforms
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * Verifies if an image matches a quest description using OpenAI's Vision API
 */
export const verifyQuestImage = async (
  imageUri: string,
  questTitle: string,
  questDescription: string
): Promise<{ isValid: boolean; message: string }> => {
  try {
    // Convert image to base64
    const base64Image = await imageToBase64(imageUri);
    
    // Prepare the prompt for OpenAI
    const prompt = `
      I'm completing an eco-challenge quest with the following details:
      Title: ${questTitle}
      Description: ${questDescription}
      
      Based on the image I've provided, please verify if it shows evidence that I've completed this eco-challenge.
      Respond with "VERIFIED" if the image appears to show completion of this specific challenge, or "NOT VERIFIED" if it doesn't.
      Then provide a brief explanation of your decision.
    `;
    
    // Prepare the API request
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "low" // Use low detail to reduce token usage
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return { 
        isValid: false, 
        message: 'Error verifying image. Please try again.' 
      };
    }
    
    const aiResponse = data.choices[0].message.content;
    const isVerified = aiResponse.includes('VERIFIED');
    
    // Extract explanation (everything after the VERIFIED/NOT VERIFIED)
    const explanation = aiResponse.split(/VERIFIED|NOT VERIFIED/)[1]?.trim() || 
      (isVerified ? 'Image successfully verified!' : 'Image does not appear to match the quest requirements.');
    
    return {
      isValid: isVerified,
      message: explanation
    };
  } catch (error) {
    console.error('Error verifying quest image:', error);
    return {
      isValid: false,
      message: 'Error processing image. Please try again.'
    };
  }
};