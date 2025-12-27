import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  FlatList
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView
} from 'react-native-safe-area-context';
import {
  generateGame,
  validateGame
} from './utils/lotofacil';

const { width } = Dimensions.get('window');

export default function App() {
  const [lastResult, setLastResult] = useState('');
  const [generatedGames, setGeneratedGames] = useState([]);
  const [filters, setFilters] = useState({
    repsEnabled: true,
    evensEnabled: true,
    primesEnabled: true,
    fibEnabled: true,
    seqEnabled: true,
  });

  const [loading, setLoading] = useState(false);

  // Convert string input "01 02 03..." to array [1, 2, 3...]
  const parseLastResult = () => {
    return lastResult
      .split(/[\s,.-]+/)
      .map(n => parseInt(n))
      .filter(n => !isNaN(n) && n >= 1 && n <= 25);
  };

  const handleGenerate = () => {
    setLoading(true);
    const lastResultArr = parseLastResult();
    const newGames = [];
    let attempts = 0;

    // Attempt to find 5 games that pass the filters
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
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
              <FilterBadge active={filters.repsEnabled} label="Repetidas (8-10)" onPress={() => toggleFilter('repsEnabled')} />
              <FilterBadge active={filters.evensEnabled} label="Pares (6-8)" onPress={() => toggleFilter('evensEnabled')} />
              <FilterBadge active={filters.primesEnabled} label="Primos (4-6)" onPress={() => toggleFilter('primesEnabled')} />
              <FilterBadge active={filters.fibEnabled} label="Fibonacci (3-5)" onPress={() => toggleFilter('fibEnabled')} />
              <FilterBadge active={filters.seqEnabled} label="Sequências (3-5)" onPress={() => toggleFilter('seqEnabled')} />
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
              <View style={styles.gameNumberRow}>
                {item.numbers.map(num => (
                  <View key={num} style={styles.ball}>
                    <Text style={styles.ballText}>{num.toString().padStart(2, '0')}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.gameStatsRow}>
                <StatLabel label="Reps" value={item.stats.repetitions} />
                <StatLabel label="Pares" value={item.stats.evens} />
                <StatLabel label="Primos" value={item.stats.primes} />
                <StatLabel label="Fib" value={item.stats.fibonacci} />
                <StatLabel label="Seq" value={item.stats.sequence} />
              </View>
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>A sorte favorece quem se prepara.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const FilterBadge = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.badge, active ? styles.badgeActive : styles.badgeInactive]}
    onPress={onPress}
  >
    <Text style={[styles.badgeText, active ? styles.badgeTextActive : styles.badgeTextInactive]}>{label}</Text>
  </TouchableOpacity>
);

const StatLabel = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}:</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f021a', // Deep Purple Dark
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e0c3fc', // Light Purple
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
    backgroundColor: '#ff9100', // Gold/Orange
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
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#3c096c',
    fontSize: 12,
  },
});