/** Func Returns PAGE CommentForm
 * @param {route} data.reply
 * 
 *
 *    
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Button, Image, Text, ScrollView, Alert, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'react-native-image-picker'
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import ImageResizer from 'react-native-image-resizer';
import { useGlobalStates } from '../items/States';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import Captcha from './Captcha';
import HTMLView from 'react-native-htmlview';
import { useTranslation } from 'react-i18next';

//UPLOAD IMAGE CONDITIONS
const MAX_IMAGE_WIDTH = 320;
const MAX_IMAGE_HEIGHT = 240;
const MAX_TEXT_FILE_SIZE = 100 * 1024; // 100 kB

const CommentForm = ({ navigation, route }) => {
    const { wsSend, wsState, theme, setFlag, flag } = useGlobalStates();
    const { t } = useTranslation();
    const [avatar, setAvatar] = useState({ baseImage: '', uri: '' });
    const editorRef = useRef();
    const [formData, setFormData] = useState({ name: '', email: '', homepage: '', text: '', file: null });
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                sendStoredComments();
            }
        });
        return () => {
            unsubscribeNetInfo();
        };
    }, []);

    const userInfo = [
        { id: "username", text: t('commentForm.name'), placeholder: t('commentForm.namePlaceholder'), pattern: "^[A-Za-z0-9]+$", required: true, rule: `${t('commentForm.nameRule')} (Latin)`, maxLength: 10 },
        { id: "email", text: t('commentForm.email'), placeholder: t('commentForm.name'), placeholder: t('commentForm.emailPlaceholder'), pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", required: true, rule: t('commentForm.emailRule'), maxLength: 20 },
        { id: "homepage", text: `${t('commentForm.homepage')} (optional)`, placeholder: t('commentForm.homepagePlaceholder'), pattern: "^(ftp|http|https):\\/\\/[^ \"\\n]+", required: false, rule: t('commentForm.homepageRule'), maxLength: 20 },
    ];
    const inputChange = (id, value) => {
        setFormData(prevData => ({ ...prevData, [id]: value }));
    };

    const validRegExp = (pattern, value) => {
        if (!pattern) return true;
        return new RegExp(pattern).test(value);
    };

    const validateXHTML = (htmlString) => {
        const allowedTagsPattern = /<(\/?(?:a|code|i|strong|b))(\s+[^>]*?)?>/g;
        const stack = [];
        const tagRegex = /<(\/?)([a-zA-Z]+)[^>]*>/g;
        const divContentRegex = /<div[^>]*>(.*?)<\/div>/gs;
        const match = divContentRegex.exec(htmlString);
        if (!match) {
            return false;
        }
        const text = match[1];

        let tagMatch;
        while ((tagMatch = tagRegex.exec(text)) !== null) {
            const fullTag = tagMatch[0];
            const isClosingTag = tagMatch[1] === '/';
            const tagName = tagMatch[2];

            if (!fullTag.match(allowedTagsPattern)) {
                return false;
            }
            if (isClosingTag) {
                const lastOpenedTag = stack.pop();
                if (!lastOpenedTag || lastOpenedTag !== tagName) {
                    return false;
                }
            } else if (!fullTag.endsWith('/>')) {
                stack.push(tagName);
            }
        }
        return stack.length === 0;
    };
    const formSubmit = async () => {
        for (const field of userInfo) {
            const value = formData[field.id];

            if (field.required && !value) {
                Alert.alert("Error", `${field.text} is a required field.`);
                return;
            }
            if (value && !validRegExp(field.pattern, value)) {
                Alert.alert("Error", `Invalid ${field.text} format.`);
                return;
            }
        }
        let mess = await editorRef.current.getContentHtml();
        mess = mess.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

        if (!mess.length) {
            Alert.alert("Error", `Message is a required field.`);
            return;
        }
        if (!validateXHTML(mess)) {
            Alert.alert('Invalid message', 'Your message contains invalid or improperly closed tags.');
            return;
        }
        setFormData(prevData => ({ ...prevData, text: mess }));
        setShowCaptcha(true)
    };

    const handleCaptchaSubmit = async () => {
        if (isConnected) {
            if (wsState === 1) {
                wsSend({
                    type: 'database',
                    action: 'addComment',
                    data: {
                        ...formData,
                        avatar: avatar.baseImage, parent_id: route.params && route.params.id + route.params.email || null
                    }
                })
                setFlag(!flag)
            }
        } else {
            storeComment({
                ...formData,
                avatar: avatar.baseImage, parent_id: route.params && route.params.id + route.params.email || null
            });
        }
        navigation.goBack();

    }
    const storeComment = async (comment) => {
        try {
            const storedComments = JSON.parse(await AsyncStorage.getItem('comments')) || [];
            storedComments.push(comment);
            await AsyncStorage.setItem('comments', JSON.stringify(storedComments));
        } catch (error) {
            console.error('Failed to store comment', error);
        }
    };

    const sendStoredComments = async () => {
        try {
            const storedComments = JSON.parse(await AsyncStorage.getItem('comments')) || [];
            for (const comment of storedComments) {
                if (wsState === 1) {
                    wsSend({
                        type: 'database',
                        action: 'addComment',
                        data: {
                            ...comment
                        }
                    })
                }
            }
            await AsyncStorage.removeItem('comments');
        } catch (error) {
            console.error('Failed to send stored comments', error);
        }
    };

    const pickImage = () => {
        const options = {
            title: 'Choice Image',
            selectLimit: 1,
            includeBase64: true,
            mediaType: 'photo',
        };
        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('Cancel ImagePicker');
            } else if (response.error) {
                console.log('ERROR ImagePicker: ', response.error);
            } else {
                const itemImage = response.assets[0];
                setAvatar(prevData => ({ ...prevData, baseImage: itemImage.base64 }));
                setAvatar(prevData => ({ ...prevData, uri: itemImage.uri }));
            }
        });
    };
    const handleFileUpload = async () => {
        const options = {
            mediaType: 'mixed',
            includeBase64: true,
        };

        ImagePicker.launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const file = response.assets[0];

                if (file.type.startsWith('image/')) {
                    const resizedImage = await resizeImage(file.uri, MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT);
                    const base64Image = await RNFS.readFile(resizedImage.uri, 'base64');
                    setFormData(prevData => ({ ...prevData, file: { type: 'image', content: base64Image } }));
                    setFilePreview({ uri: resizedImage.uri, type: 'image' });
                } else if (file.type === 'text/plain' && file.fileSize <= MAX_TEXT_FILE_SIZE) {
                    const fileContent = await RNFS.readFile(file.uri);
                    const base64Content = Buffer.from(fileContent).toString('base64');
                    setFormData(prevData => ({ ...prevData, file: { type: 'text', content: base64Content } }));
                    setFilePreview({ uri: file.uri, type: 'text' });
                } else {
                    Alert.alert('Error', 'Invalid file type or size.');
                }
            }
        });
    };

    const resizeImage = (uri, maxWidth, maxHeight) => {
        return new Promise((resolve, reject) => {
            ImageResizer.createResizedImage(uri, maxWidth, maxHeight, 'JPEG', 100)
                .then(response => {
                    resolve(response);
                })
                .catch(err => {
                    reject(err);
                });
        });
    };

    return (

        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: `${theme === 'dark' ? '#dfcccc95' : 'white'}` }]}>
            {route.params &&
                <View style={styles.replyContainer} >
                    <View style={styles.replyHeader} >
                        <Text style={styles.replyText}>Reply to user {route.params.username}:</Text>
                    </View>
                    <HTMLView value={decodeURIComponent(route.params.text)} />
                </View>
            }
            <View style={styles.avatarContainer} >
                <Pressable onPress={() => { !showCaptcha && pickImage() }} >
                    <Image source={{ uri: avatar.uri ? avatar.uri : `http://localhost:3434/user-account.png` }} style={styles.avatar} />
                </Pressable >
                {!showCaptcha && <Button title={t('commentForm.avatarBtn')} onPress={pickImage} />}
            </View >
            {
                userInfo.map(info => (
                    <View key={info.id} style={{ marginBottom: 10 }}>
                        <Text style={styles.title}>{info.text}</Text>
                        <TextInput
                            placeholder={info.placeholder}
                            onChangeText={value => inputChange(info.id, value)}
                            value={formData[info.id] || ''}
                            style={styles.input}
                            editable={!showCaptcha}
                            maxLength={info.maxLength}
                        />
                        < Text style={styles.rule}>{info.rule}</Text>
                    </View>
                ))
            }
            <RichEditor
                ref={editorRef}
                style={{ minHeight: 150, borderWidth: 1, marginBottom: 10, padding: 10 }}
                initialContentHTML=""
                disabled={showCaptcha && 'false'}
            />
            <RichToolbar
                editor={editorRef}
                style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
                actions={[actions.setBold, actions.setItalic, actions.insertLink, actions.code]}
                selectedButtonStyle={{
                    backgroundColor: 'yellow', borderRadius: 10
                }}
            />
            <View style={{ alignItems: 'center' }}>
                {!showCaptcha && <Button title={`${t('commentForm.btnDownload')} (optional)`} onPress={handleFileUpload} />}
                {filePreview && filePreview.type === 'image' && (
                    <Image
                        source={{ uri: filePreview.uri }}
                        style={{ width: MAX_IMAGE_WIDTH, height: MAX_IMAGE_HEIGHT, marginVertical: 10 }}
                    />
                )}
                {filePreview && filePreview.type === 'text' && (
                    <Text style={{ marginVertical: 10 }}>{filePreview.uri}</Text>
                )}
            </View>
            {
                showCaptcha ?
                    <>
                        <Captcha submit={() => handleCaptchaSubmit()} />
                        <Button title={t('commentForm.btnCancel')} onPress={() => setShowCaptcha(false)} />
                    </>
                    :
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <TouchableOpacity style={styles.btnSubmit} onPress={formSubmit} >
                            <Text style={styles.btnSubmitText}>{t('commentForm.btnSubmit')}</Text>
                        </TouchableOpacity>
                    </View>
            }

        </ScrollView >

    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20, paddingBottom: 250
    },
    replyContainer: {
        borderWidth: 1,
        paddingBottom: 10,
        borderColor: 'lightgray',
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    replyHeader: {
        width: '100%',
        backgroundColor: 'lightgray',
        borderRadius: 10,
        padding: 11,
        marginBottom: 10,
    },
    replyText: {
        padding: 5,
        fontSize: 15,
        fontWeight: '600',
        borderBottomWidth: 1,
        color: 'blue'
    },
    avatarContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
        padding: 5
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'white',
        marginBottom: 10
    },
    input: {
        width: '80%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
    },
    title: {
        fontWeight: '500',
        marginBottom: 5,
    },
    rule: {
        fontWeight: '200',
        color: 'gray',
        marginBottom: 10,
        marginTop: 5,
    },
    btnSubmit: {
        width: '60%', alignItems: 'center', backgroundColor: 'lightgreen', padding: 10, borderRadius: 10
    },
    btnSubmitText: {
        fontSize: 20, color: 'white', fontWeight: '800'
    }
});

export default CommentForm;
