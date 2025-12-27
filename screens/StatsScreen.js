import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
    const [frequencies, setFrequencies] = useState([]);
    const [contestRange, setContestRange] = useState({ start: null, end: null });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setError(null);
            setLoading(true);

            // 1. Get latest contest number
            const latestResp = await fetch('https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest');
            if (!latestResp.ok) throw new Error('Falha ao conectar com a API');
            const latestData = await latestResp.json();
            const latestConcurso = latestData.concurso;

            // 2. Prepare array for all 7 results
            const allResults = [latestData.dezenas];

            // 3. Fetch previous 6 contests
            const fetchPromises = [];
            for (let i = 1; i <= 6; i++) {
                fetchPromises.push(
                    fetch(`https://loteriascaixa-api.herokuapp.com/api/lotofacil/${latestConcurso - i}`)
                        .then(res => res.json())
                        .catch(() => null) // Handle single fetch failure
                );
            }

            const prevResultsData = await Promise.all(fetchPromises);
            prevResultsData.forEach(res => {
                if (res && res.dezenas) allResults.push(res.dezenas);
            });

            // Update contest range
            if (allResults.length > 0) {
                setContestRange({
                    start: latestConcurso - (allResults.length - 1),
                    end: latestConcurso
                });
            }

            // 4. Calculate frequencies
            const freqMap = {};
            for (let i = 1; i <= 25; i++) freqMap[i] = 0;

            allResults.forEach(draw => {
                draw.forEach(num => {
                    const n = parseInt(num);
                    if (freqMap[n] !== undefined) freqMap[n]++;
                });
            });

            // 5. Convert to sorted array
            const sortedFreqs = Object.keys(freqMap).map(num => ({
                number: parseInt(num),
                count: freqMap[num],
                percentage: ((freqMap[num] / allResults.length) * 100).toFixed(0)
            })).sort((a, b) => b.count - a.count || a.number - b.number);

            setFrequencies(sortedFreqs);
        } catch (err) {
            console.error(err);
            setError('Não foi possível carregar as estatísticas. Verifique sua conexão.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStats();
    }, []);

    const getIntensityColor = (count) => {
        if (count >= 6) return '#ff4d4d'; // Quente (Red)
        if (count >= 4) return '#ffb703'; // Médio (Orange/Gold)
        if (count >= 2) return '#7b2cbf'; // Normal (Purple)
        return '#219ebc'; // Frio (Blue)
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#ff9100" />
                <Text style={styles.loadingText}>Analisando últimos 7 concursos...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff9100" />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>Frequência</Text>
                <Text style={styles.subtitle}>Ranking dos últimos 7 sorteios</Text>
                {contestRange.start && (
                    <View style={styles.rangeBadge}>
                        <Text style={styles.rangeText}>
                            Concursos {contestRange.start} até {contestRange.end}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#ff4d4d' }]} />
                    <Text style={styles.legendText}>Quentes</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#ffb703' }]} />
                    <Text style={styles.legendText}>Médios</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#219ebc' }]} />
                    <Text style={styles.legendText}>Frios</Text>
                </View>
            </View>

            <View style={styles.rankingCard}>
                {frequencies.map((item, index) => (
                    <View key={item.number} style={styles.rankItem}>
                        <View style={styles.rankLeft}>
                            <Text style={styles.positionText}>{index + 1}º</Text>
                            <View style={[styles.numberBall, { backgroundColor: getIntensityColor(item.count) }]}>
                                <Text style={styles.numberBallText}>{item.number.toString().padStart(2, '0')}</Text>
                            </View>
                        </View>

                        <View style={styles.rankRight}>
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${(item.count / 7) * 100}%`,
                                            backgroundColor: getIntensityColor(item.count)
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.countText}>{item.count}x ({item.percentage}%)</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#0f021a',
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f021a',
    },
    loadingText: {
        color: '#7b2cbf',
        marginTop: 15,
        fontSize: 16,
    },
    header: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#e0c3fc',
    },
    subtitle: {
        fontSize: 14,
        color: '#9d4edd',
        marginTop: 5,
    },
    rangeBadge: {
        marginTop: 10,
        backgroundColor: 'rgba(255, 145, 0, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 145, 0, 0.3)',
    },
    rangeText: {
        fontSize: 12,
        color: '#ff9100',
        fontWeight: 'bold',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 25,
        gap: 15,
        backgroundColor: '#1d0c2e',
        padding: 10,
        borderRadius: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        color: '#e0c3fc',
        fontSize: 12,
    },
    rankingCard: {
        backgroundColor: '#1d0c2e',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: '#3c096c',
    },
    rankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(60, 9, 108, 0.5)',
    },
    rankLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        width: 100,
    },
    positionText: {
        color: '#7b2cbf',
        fontSize: 14,
        fontWeight: 'bold',
        width: 30,
    },
    numberBall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    numberBallText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    rankRight: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#0f021a',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    countText: {
        color: '#e0c3fc',
        fontSize: 12,
        fontWeight: '600',
        width: 60,
        textAlign: 'right',
    }
});
