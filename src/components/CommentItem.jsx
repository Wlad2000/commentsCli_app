/** Func Returns CommentItem
 * @param {data,data} comment,replies
 * 
 *
 *    
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HTMLView from 'react-native-htmlview';
import RNFS from 'react-native-fs';
import { useTranslation } from 'react-i18next';

const CommentItem = ({ comment, replies }) => {
    const navigation = useNavigation();
    const [showReplies, setShowReplies] = useState(false);
    const [showImage, setShowImage] = useState(false);
    const { t, i18n } = useTranslation();

    useEffect(() => {
    }, []);

    const handleFileDownload = async (url) => {
        const fileName = url.split('/').pop();
        const downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        RNFS.downloadFile({
            fromUrl: `http://localhost:3434/${url}`,
            toFile: downloadDest,
        }).promise.then(res => {
            Alert.alert('Success', 'File downloaded successfully to ' + downloadDest);
        }).catch(err => {
            Alert.alert('Error', 'File download failed');
            console.error(err);
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header} >
                <Image source={{ uri: `http://localhost:3434/${comment.avatar}` }} style={styles.avatar} />
                <View>
                    <Text style={styles.username}>{comment.username}</Text>
                    <Text style={styles.data}>{comment.email}</Text>
                </View >
                <Text style={styles.data}>{comment.created_at}</Text>
            </View >
            <HTMLView value={decodeURIComponent(comment.text)} />
            {
                comment.file &&
                <>
                    <View style={styles.fileContainer}>
                        <TouchableOpacity
                            style={[styles.fileBtn, { display: `${['jpg', 'jpeg', 'png'].includes(comment.file.split('.').pop().toLowerCase()) ? '' : 'none'}` }]}
                            onPress={() => setShowImage(!showImage)}
                        >
                            <Text style={{ color: 'black' }}>{showImage ? t('commentItem.btnShowFile2') : t('commentItem.btnShowFile1')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.fileBtn} onPress={() => handleFileDownload(comment.file)}>
                            <Text style={{ color: 'black' }}>{t('commentItem.btnDownload')}</Text>
                        </TouchableOpacity>
                    </View >
                    {
                        showImage &&
                        <Image
                            source={{ uri: `http://localhost:3434/${comment.file}` }}
                            style={{ width: 250, height: 200 }}
                            resizeMode="contain"
                        />
                    }
                </>
            }
            <TouchableOpacity style={styles.replyBtn} onPress={() => navigation.navigate('CommentForm', comment)}>
                <Text style={styles.replyBtnText}>{t('commentItem.btnReply')}</Text>
            </TouchableOpacity>
            {
                replies?.filter((repl) => repl.parent_id == `${comment.id}${comment.email}`).length > 0 && (
                    <Button
                        title={showReplies ? t('commentItem.btnShowReply2') : t('commentItem.btnShowReply1')}
                        onPress={() => { setShowReplies(!showReplies) }}
                        color={'gray'}
                    />
                )
            }
            {
                showReplies && (
                    <View style={styles.repliesContainer}>
                        {replies.filter((repl) => repl.parent_id == `${comment.id}${comment.email}`).map((item) => (
                            <CommentItem key={item.id} comment={item} replies={replies} />
                        ))}
                    </View >
                )
            }
        </View >
    );
};
const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        display: 'flex',
        flexDirection: 'column',
        borderColor: 'gray',
        padding: 5
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 20,
        marginTop: 20,
        alignItems: 'center',
        backgroundColor: 'lightgray',
        padding: 10,
        columnGap: 15,
    },
    username: {
        fontWeight: '800'
    },
    data: {
        fontSize: 12, fontWeight: '200'
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'white'

    },
    fileContainer: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 10,
        justifyContent: 'flex-end',
        marginTop: 2,
        marginBottom: 2
    }
    ,
    fileBtn: {
        backgroundColor: 'lightgray',
        padding: 7,
        borderRadius: 20
    },
    replyBtn: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 20,
        padding: 7,
        marginTop: 10,
        marginBottom: 5
    },
    replyBtnText: {
        color: 'blue',
        fontSize: 16,
        fontWeight: '600'
    }
    ,
    repliesContainer: {
        display: 'flex',
        width: '100%',
        borderLeftWidth: 1,
        borderColor: 'gray',
        marginLeft: 1,
        paddingLeft: 1
    }

});
export default CommentItem;
