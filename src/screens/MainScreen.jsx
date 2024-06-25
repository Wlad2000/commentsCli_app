/****************************************************************************
** Home Page 
** contain:  Comment items;
**
**
****************************************************************************/
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Button, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import CommentItem from '../components/CommentItem';
import { useGlobalStates } from '../items/States';
import { useTranslation } from 'react-i18next';
import { fetchWeather } from '../utils/api';
import { getCurrentLocation } from '../utils/util';
import { useFocusEffect } from '@react-navigation/native';


const MainScreen = ({ navigation }) => {
    const { ws, wsSend, wsState, theme, setTheme, flag } = useGlobalStates();
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState([]);
    const [sortConfig, setSortConfig] = useState({ field: 'created_at', order: 'DESC' });
    const [page, setPage] = useState(0);
    const [perPage] = useState(25);
    const [isEnglish, setIsEnglish] = useState(true);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetchLocationAndSunTimes();
        if (!ws) return;
        if (wsState === 1) {
            setLoading(true);
            wsSend({
                type: "database",
                action: 'getComments',
                data: {
                    sortField: sortConfig.field,
                    sortOrder: sortConfig.order,
                    page,
                    perPage
                }
            });
            wsSend({
                type: "database",
                action: 'getReplies',
                data: {
                }
            });
            ws.addEventListener('message', (event) => {
                const { type, data } = JSON.parse(event.data);
                if (type === "comments") {
                    setComments(data);
                    setLoading(false);
                }
            })
            ws.addEventListener('message', (event) => {
                const { type, data } = JSON.parse(event.data);
                if (type === "replies") {
                    setReplies(data)
                    setLoading(false)
                }
            })
        }
    }, [wsState, sortConfig, page, flag]);

    const fetchLocationAndSunTimes = async () => {
        try {
            const location = await getCurrentLocation();
            const { latitude, longitude } = location;
            const weatherData = await fetchWeather(latitude, longitude);
            if (weatherData) {
                const now = new Date();
                const todayIndex = weatherData.daily.time.findIndex(date => date === now.toISOString().split('T')[0]);

                if (todayIndex !== -1) {
                    const sunrise = new Date(weatherData.daily.sunrise[todayIndex]);
                    const sunset = new Date(weatherData.daily.sunset[todayIndex]);

                    if (now >= sunrise && now < sunset) {
                        setTheme('light');
                    } else {
                        setTheme('dark');
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };
    const handleSort = (field) => {
        if (sortConfig.field === field) {
            setSortConfig((prevConfig) => ({
                field,
                order: prevConfig.field === field && prevConfig.order === 'ASC' ? 'DESC' : 'ASC'
            }));
        } else {
            setSortConfig((prevConfig) => ({
                field,
                order: 'ASC'
            }));
        }
        setPage(0);
    };
    const renderSortArrow = (field) => {
        if (sortConfig.field === field) {
            return sortConfig.order === 'ASC' ? '🔼' : '🔽';
        }
        return '';
    };


    return (
        <View style={[styles.container, { backgroundColor: `${theme === 'dark' ? '#37313188' : 'white'}` }]}>
            < View style={styles.containerHeader} >
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CommentForm')}>
                    <Text style={styles.addButtonText}>{t('mainScreen.btnAdd')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.langButton} onPress={() => { setIsEnglish(!isEnglish); i18n.changeLanguage(isEnglish ? 'uk' : 'en'); }}>
                    <Text style={styles.addButtonText}>{isEnglish ? 'EN' : 'UA'}</Text>
                </TouchableOpacity>
            </View >
            <View style={styles.sortButtonsContainer}>
                <Text style={styles.sortTitle} > {t('mainScreen.sortTitle')}: </Text>
                <TouchableOpacity style={styles.sortButton} onPress={() => handleSort('username')} >
                    <Text style={{ fontSize: 15, color: `${sortConfig.field === 'username' ? 'blue' : 'gray'}`, fontWeight: 800 }}>{`${t('mainScreen.sortBtn1')}  ${renderSortArrow('username')}`} </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortButton} onPress={() => handleSort('email')}>
                    <Text style={{ fontSize: 15, color: `${sortConfig.field === 'email' ? 'blue' : 'gray'}`, fontWeight: 800 }}>{`${t('mainScreen.sortBtn2')}  ${renderSortArrow('email')}`} </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortButton} onPress={() => handleSort('created_at')}>
                    <Text style={{ fontSize: 15, color: `${sortConfig.field === 'created_at' ? 'blue' : 'gray'}`, fontWeight: 800 }}>{`${t('mainScreen.sortBtn3')}  ${renderSortArrow('created_at')}`} </Text>
                </TouchableOpacity>
            </View >
            <View style={styles.paginationContainer}>
                <Button title={t('mainScreen.paginationBtn1')} onPress={() => setPage(page - 1)} disabled={page === 0} />
                <Button title={t('mainScreen.paginationBtn2')} onPress={() => setPage(page + 1)} disabled={comments.length < perPage} />
            </View>
            {
                loading ? (
                    <View style={styles.messageContainer} >
                        <ActivityIndicator size="large" color="#007BFF" />
                    </View>
                ) : (
                    <>
                        {comments.length === 0 ? (
                            <View style={styles.messageContainer}>
                                <Text style={styles.noCommentsText}>No comments available</Text>
                            </View>
                        ) : (
                            <FlatList
                                style={{ height: '70%' }}
                                data={comments}
                                renderItem={({ item }) => <CommentItem comment={item} replies={replies} />}
                                keyExtractor={(item) => item.id.toString()}
                                onEndReachedThreshold={0.5}
                            />
                        )}
                    </>
                )
            }
        </View >
    );
};
const styles = StyleSheet.create({
    container: {
        padding: 10,
        height: '100%',
        paddingBottom: 30,
    },
    containerHeader: {
        alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10
    },
    addButton: {
        width: '50%', alignItems: 'center', backgroundColor: 'lightgreen', padding: 10, borderRadius: 10
    },
    addButtonText: {
        fontSize: 20, color: 'white', fontWeight: '800'
    },
    langButton: {
        alignItems: 'center', backgroundColor: 'lightgray', padding: 10, borderRadius: 50, justifyContent: 'center'
    },
    sortButtonsContainer: {
        borderBottomWidth: 1, borderTopWidth: 1, borderColor: 'lightgray', display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 1, padding: 5
    },
    sortButton: {
        width: '27%', alignItems: 'center', padding: 10, borderRadius: 10
    },
    sortTitle: {
        fontSize: 15, fontWeight: '800', color: 'black'
    },
    paginationContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        padding: 2,
        borderColor: 'lightgray'
    },
    messageContainer: {
        height: '70%', alignItems: 'center', justifyContent: 'center'
    },
    noCommentsText: {
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 18,
    },

});
export default MainScreen;
