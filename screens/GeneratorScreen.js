import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Clipboard,
    Alert,
    SafeAreaView
} from 'react-native';
import {
    generateGame,
    validateGame
} from '../utils/lotofacil';

const { width } = Dimensions.get('window');

const FilterBadge = ({ label, active, onPress, color = '#7b2cbf' }) => (
    <TouchableOpacity
        style={[
            styles.badge,
            active ? { backgroundColor: color, borderColor: color } : styles.badgeInactive
        ]}
        onPress={onPress}
    >
        <Text style={[styles.badgeText, active ? styles.badgeTextActive : { color: color }]}>{label}</Text>
    </TouchableOpacity>
);

const StatLabel = ({ label, value, color = '#9d4edd' }) => (
    <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: color }]}>{label}:</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

export default function GeneratorScreen({ lastResult, setLastResult }) {
    const [generatedGames, setGeneratedGames] = useState([]);
    const [filters, setFilters] = useState({
        repsEnabled: true,
        evensEnabled: true,
        primesEnabled: true,
        fibEnabled: true,
        seqEnabled: true,
    });

    const [loading, setLoading] = useState(false);

    const parseLastResult = () => {
        if (!lastResult) return [];
        return lastResult
            .split(/[\s,.-]+/)
            .map(n => parseInt(n))
            .filter(n => !isNaN(n) && n >= 1 && n <= 25);
    };

    const lastResultArr = React.useMemo(() => parseLastResult(), [lastResult]);

    const handleGenerate = () => {
        setLoading(true);
        const newGames = [];
        let attempts = 0;

        while (newGames.length < 5 && attempts < 5000) {
            const game = generateGame();
            const validation = validateGame(game, lastResultArr, filters);
            if (validation.pass) {
                newGames.push({ numbers: game, stats: validation });
            }
            attempts++;
        }

        setGeneratedGames(newGames);
        setLoading(false);
    };

    const toggleFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const copyGame = (numbers) => {
        const formattedNumbers = numbers
            .slice(0, 15)
            .map(n => n.toString().padStart(2, '0'))
            .join(' ');
        Clipboard.setString(formattedNumbers);
        Alert.alert('✅ Copiado!', `Jogo copiado: ${formattedNumbers}`);
    };

    const copyAllGames = () => {
        if (generatedGames.length === 0) {
            Alert.alert('⚠️ Atenção', 'Nenhum jogo para copiar!');
            return;
        }

        const allGamesText = generatedGames
            .map((game) => {
                return game.numbers
                    .slice(0, 15)
                    .map(n => n.toString().padStart(2, '0'))
                    .join(' ');
            })
            .join('\n\n');

        Clipboard.setString(allGamesText);
        Alert.alert('✅ Todos Copiados!', `${generatedGames.length} jogos copiados!`);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f021a' }}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>LotoFácil Pro</Text>
                    <Text style={styles.subtitle}>Gerador Inteligente de Jogos</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Resultado Anterior</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 01 02 05 08..."
                        placeholderTextColor="#888"
                        value={lastResult}
                        onChangeText={setLastResult}
                        keyboardType="numeric"
                    />
                    <Text style={styles.helperText}>Use espaços ou vírgulas para separar os números.</Text>
                </View>

                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Filtros Ativos (Padrões de Ouro)</Text>
                    <View style={styles.filterGrid}>
                        <FilterBadge active={filters.repsEnabled} label="Repetidas (8-10)" onPress={() => toggleFilter('repsEnabled')} color="#ffb703" />
                        <FilterBadge active={filters.evensEnabled} label="Pares (6-8)" onPress={() => toggleFilter('evensEnabled')} color="#219ebc" />
                        <FilterBadge active={filters.primesEnabled} label="Primos (4-6)" onPress={() => toggleFilter('primesEnabled')} color="#06d6a0" />
                        <FilterBadge active={filters.fibEnabled} label="Fibonacci (3-5)" onPress={() => toggleFilter('fibEnabled')} color="#ef476f" />
                        <FilterBadge active={filters.seqEnabled} label="Sequências (3-5)" onPress={() => toggleFilter('seqEnabled')} color="#fb8500" />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.generateButton, loading && styles.disabledButton]}
                    onPress={handleGenerate}
                    disabled={loading}
                >
                    <Text style={styles.generateButtonText}>{loading ? 'Analisando...' : 'GERAR JOGOS FILTRADOS'}</Text>
                </TouchableOpacity>

                <View style={styles.resultsHeader}>
                    <Text style={styles.sectionTitle}>Sugestões de Jogos</Text>
                    {generatedGames.length === 0 && !loading && (
                        <Text style={styles.emptyText}>Clique em Gerar para ver os palpites baseados em seus filtros.</Text>
                    )}
                </View>

                {generatedGames.map((item, index) => (
                    <View key={index} style={styles.gameCard}>
                        <View style={styles.debugBadge}>
                            <Text style={styles.debugText}>Jogo {index + 1}</Text>
                        </View>

                        <View style={styles.gameNumberRow}>
                            {item.numbers.slice(0, 15).map(num => {
                                const isRepeated = lastResultArr.includes(num);
                                return (
                                    <View
                                        key={num}
                                        style={[
                                            styles.ball,
                                            isRepeated && { backgroundColor: '#ffb703' }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.ballText,
                                            isRepeated && { color: '#000' }
                                        ]}>
                                            {num.toString().padStart(2, '0')}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                        <View style={styles.gameStatsRow}>
                            <StatLabel label="Reps" value={item.stats.reps} color="#ffb703" />
                            <StatLabel label="Pares" value={item.stats.pares} color="#219ebc" />
                            <StatLabel label="Primos" value={item.stats.primos} color="#06d6a0" />
                            <StatLabel label="Fib" value={item.stats.fib} color="#ef476f" />
                            <StatLabel label="Seq" value={item.stats.seq} color="#fb8500" />
                        </View>

                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={() => copyGame(item.numbers)}
                        >
                            <Text style={styles.copyButtonText}>📋 Copiar Jogo</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {generatedGames.length > 0 && (
                    <TouchableOpacity
                        style={styles.copyAllButton}
                        onPress={copyAllGames}
                    >
                        <Text style={styles.copyAllButtonText}>📋 Copiar Todos os Jogos ({generatedGames.length})</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#0f021a',
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#e0c3fc',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: '#9d4edd',
        textTransform: 'uppercase',
        marginTop: 5,
    },
    card: {
        backgroundColor: '#1d0c2e',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#3c096c',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#0f021a',
        borderRadius: 8,
        padding: 15,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#5a189a',
    },
    helperText: {
        color: '#7b2cbf',
        fontSize: 12,
        marginTop: 8,
    },
    filterSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#e0c3fc',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    filterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeActive: {
        backgroundColor: '#7b2cbf',
        borderColor: '#9d4edd',
    },
    badgeInactive: {
        backgroundColor: 'rgba(123, 44, 191, 0.1)',
        borderColor: '#3c096c',
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '500',
    },
    badgeTextActive: {
        color: '#fff',
    },
    badgeTextInactive: {
        color: '#7b2cbf',
    },
    generateButton: {
        backgroundColor: '#ff9100',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ff9100',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 30,
    },
    disabledButton: {
        backgroundColor: '#555',
    },
    generateButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultsHeader: {
        marginBottom: 15,
    },
    emptyText: {
        color: '#5a5a5a',
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
    gameCard: {
        backgroundColor: '#1d0c2e',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#3c096c',
    },
    gameNumberRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 15,
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
    gameStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#3c096c',
        paddingTop: 10,
        marginBottom: 10,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statLabel: {
        color: '#9d4edd',
        fontSize: 11,
        marginRight: 3,
    },
    statValue: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    copyButton: {
        backgroundColor: '#5a189a',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#7b2cbf',
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    copyAllButton: {
        backgroundColor: '#ff9100',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#ff9100',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    copyAllButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    debugBadge: {
        backgroundColor: '#ff9100',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'center',
    },
    debugText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
