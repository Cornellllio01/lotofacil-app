import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Alert,
    SafeAreaView
} from 'react-native';

export default function ResultsScreen({ setSharedLastResult }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchResults = async () => {
        try {
            setError(null);
            // Fetching from a public API
            const response = await fetch('https://loteriascaixa-api.herokuapp.com/api/lotofacil');

            if (!response.ok) {
                throw new Error('Falha ao buscar resultados. Tente novamente mais tarde.');
            }

            const data = await response.json();
            const resultsArray = Array.isArray(data) ? data.slice(0, 5) : [data];
            setResults(resultsArray);

            // Auto-update generator with the latest result
            if (resultsArray.length > 0 && resultsArray[0].dezenas) {
                const formatted = resultsArray[0].dezenas.join(' ');
                setSharedLastResult(formatted);
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchResults();
    }, []);

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#ff9100" />
                <Text style={styles.loadingText}>Buscando sorteios...</Text>
            </View>
        );
    }

    if (error && results.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>❌ {error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchResults}>
                    <Text style={styles.retryButtonText}>TENTAR NOVAMENTE</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f021a' }}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff9100" />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Últimos Resultados</Text>
                    <Text style={styles.subtitle}>Acompanhe os sorteios oficiais</Text>
                </View>

                {results.map((item, index) => (
                    <View key={item.concurso || index} style={styles.resultCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.concursoText}>Concurso {item.concurso}</Text>
                            <Text style={styles.dateText}>{item.data}</Text>
                        </View>

                        <View style={styles.numbersGrid}>
                            {item.dezenas && item.dezenas.map((num) => (
                                <View key={num} style={styles.ball}>
                                    <Text style={styles.ballText}>{num}</Text>
                                </View>
                            ))}
                        </View>

                        {item.acumulou && (
                            <View style={styles.accumulatedBadge}>
                                <Text style={styles.accumulatedText}>ACUMULOU!</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.useResultButton}
                            onPress={() => {
                                const formatted = item.dezenas.join(' ');
                                setSharedLastResult(formatted);
                                Alert.alert('Sucesso', `Concurso ${item.concurso} enviado para o gerador!`);
                            }}
                        >
                            <Text style={styles.useResultButtonText}>USAR NO GERADOR</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {results.length === 0 && !loading && (
                    <View style={styles.placeholderCard}>
                        <Text style={styles.placeholderText}>Nenhum resultado encontrado.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#0f021a',
        minHeight: '100%',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f021a',
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#e0c3fc',
    },
    subtitle: {
        fontSize: 14,
        color: '#9d4edd',
        marginTop: 5,
    },
    loadingText: {
        color: '#7b2cbf',
        marginTop: 10,
        fontSize: 16,
    },
    errorText: {
        color: '#ff4d4d',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    retryButton: {
        backgroundColor: '#3c096c',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: '#1d0c2e',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#3c096c',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#3c096c',
        paddingBottom: 10,
    },
    concursoText: {
        color: '#ff9100',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dateText: {
        color: '#7b2cbf',
        fontSize: 14,
    },
    numbersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    ball: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#7b2cbf',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ballText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    accumulatedBadge: {
        marginTop: 15,
        backgroundColor: 'rgba(255, 145, 0, 0.1)',
        borderWidth: 1,
        borderColor: '#ff9100',
        paddingVertical: 4,
        borderRadius: 4,
        alignItems: 'center',
    },
    accumulatedText: {
        color: '#ff9100',
        fontSize: 12,
        fontWeight: 'bold',
    },
    placeholderCard: {
        backgroundColor: '#1d0c2e',
        borderRadius: 16,
        padding: 30,
        borderWidth: 1,
        borderColor: '#3c096c',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#7b2cbf',
        fontSize: 16,
    },
    useResultButton: {
        marginTop: 15,
        backgroundColor: '#ff9100',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    useResultButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
