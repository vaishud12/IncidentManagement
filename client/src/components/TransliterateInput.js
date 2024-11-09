import React, { useState } from 'react';

const TransliterateInput = ({ onTransliterate }) => {
    const [inputText, setInputText] = useState('');
    const [languageCode, setLanguageCode] = useState('mr'); // Default to Marathi

    const handleTransliterate = async () => {
        try {
            // Call your transliteration function or API here
            const result = await onTransliterate(inputText, languageCode);
            alert(`Transliterated Text: ${result}`);
        } catch (error) {
            console.error('Transliteration error:', error);
        }
    };

    return (
        <div className="transliterate-input">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type text in English to transliterate to ${languageCode}`}
            />
            <select onChange={(e) => setLanguageCode(e.target.value)} value={languageCode}>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
                {/* Add more language options as needed */}
            </select>
            <button onClick={handleTransliterate}>Transliterate</button>
        </div>
    );
};

export default TransliterateInput;
