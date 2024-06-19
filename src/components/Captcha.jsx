/** Func Returns Captcha
 * @param {func} func for submit
 * 
 *
 *    
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Canvas from 'react-native-canvas';

const Captcha = (props) => {
    const [captchaText, setCaptchaText] = useState('');
    const [userInput, setUserInput] = useState('');
    const canvasRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        initializeCaptcha();
    }, []);

    const generateRandomChar = (min, max) => String.fromCharCode(Math.floor(Math.random() * (max - min + 1)) + min);

    const generateCaptchaText = () => {
        let captcha = '';
        for (let i = 0; i < 2; i++) {
            captcha += generateRandomChar(65, 90); // A-Z
            captcha += generateRandomChar(97, 122); // a-z
            captcha += generateRandomChar(48, 57); // 0-9
        }
        return captcha.split('').sort(() => Math.random() - 0.5).join('');
    };

    const drawCaptchaOnCanvas = async (ctx, captcha) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const textColors = ['#000000', '#828282'];
        const letterSpace = 150 / captcha.length;
        ctx.font = '20px Roboto Mono';
        for (let i = 0; i < captcha.length; i++) {
            ctx.fillStyle = textColors[Math.floor(Math.random() * 2)];
            ctx.fillText(
                captcha[i],
                25 + i * letterSpace,
                Math.floor(Math.random() * 16 + 25),
            );
        }
    };

    const initializeCaptcha = async () => {
        setUserInput('');
        const captcha = generateCaptchaText();
        setCaptchaText(captcha);

        const canvas = canvasRef.current;
        const ctx = await canvas.getContext('2d');
        drawCaptchaOnCanvas(ctx, captcha);
    };

    const handleCaptchaSubmit = () => {
        if (userInput.toLowerCase() === captchaText.toLowerCase()) {
            alert('Success');
            props.submit()
            setUserInput('');
        } else {
            alert('Incorrect Captcha');
            initializeCaptcha();
        }
    };

    const handleUserInputChange = (text) => {
        setUserInput(text);
    };

    return (
        <View style={styles.container}>
            <Canvas
                ref={canvasRef}
                style={styles.canvas}
                onContextCreate={async (ctx) => {
                    await drawCaptchaOnCanvas(ctx, captchaText);
                }}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter the text in the image"
                value={userInput}
                onChangeText={handleUserInputChange}
            />

            <TouchableOpacity style={styles.btnSubmit} onPress={handleCaptchaSubmit}>
                <Text style={styles.btnSubmitText}>{t('commentForm.btnSubmit')}</Text>
            </TouchableOpacity>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fadb7a',
        padding: 20,
        borderRadius: 50
    },
    canvas: {
        width: 200,
        height: 70,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 15

    },
    input: {
        width: '80%',
        height: 40,
        borderWidth: 1,
        borderColor: '#9a9a9a7b',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    btnSubmit: {
        width: '100%', alignItems: 'center', backgroundColor: 'lightgreen', padding: 10, borderRadius: 10
    },
    btnSubmitText: {
        fontSize: 20, color: 'white', fontWeight: '800'
    }
});

export default Captcha;
