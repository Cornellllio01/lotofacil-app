export const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23];
export const FIBONACCI = [1, 2, 3, 5, 8, 13, 21];

/**
 * Generates a random Lotofácil game (15 unique numbers from 1 to 25).
 * GARANTIDO: Sempre retorna exatamente 15 números únicos.
 */
export function generateGame() {
    const numbers = [];

    // Gera exatamente 15 números únicos
    while (numbers.length < 15) {
        const num = Math.floor(Math.random() * 25) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }

    // Validação extra: garante que tem exatamente 15 números
    if (numbers.length !== 15) {
        console.error('ERRO: Jogo gerado com', numbers.length, 'números');
        return generateGame(); // Tenta novamente
    }

    return numbers.sort((a, b) => a - b);
}

/**
 * Counts how many numbers are repeated from the last result.
 */
export function countRepetitions(game, lastResult) {
    if (!lastResult || lastResult.length === 0) return 0;
    return game.filter(num => lastResult.includes(num)).length;
}

/**
 * Counts even numbers.
 */
export function countEvens(game) {
    return game.filter(num => num % 2 === 0).length;
}

/**
 * Counts prime numbers.
 */
export function countPrimes(game) {
    return game.filter(num => PRIMES.includes(num)).length;
}

/**
 * Counts Fibonacci numbers.
 */
export function countFibonacci(game) {
    return game.filter(num => FIBONACCI.includes(num)).length;
}

/**
 * Finds the longest sequence of consecutive numbers.
 */
export function getLongestSequence(game) {
    if (game.length === 0) return 0;
    let maxSeq = 1;
    let currentSeq = 1;
    for (let i = 1; i < game.length; i++) {
        if (game[i] === game[i - 1] + 1) {
            currentSeq++;
        } else {
            maxSeq = Math.max(maxSeq, currentSeq);
            currentSeq = 1;
        }
    }
    return Math.max(maxSeq, currentSeq);
}

/**
 * Checks if a game passes the "Gold Rules" based on user images.
 * VALIDAÇÃO: Também verifica se o jogo tem exatamente 15 números.
 */
export function validateGame(game, lastResult, filters) {
    // Validação inicial: jogo deve ter exatamente 15 números
    if (game.length !== 15) {
        console.warn('AVISO: Jogo com', game.length, 'números. Rejeitado.');
        return {
            repetitions: 0,
            evens: 0,
            primes: 0,
            fibonacci: 0,
            sequence: 0,
            pass: false,
            details: ['Jogo inválido: não tem 15 números']
        };
    }

    const reps = countRepetitions(game, lastResult);
    const evens = countEvens(game);
    const primes = countPrimes(game);
    const fib = countFibonacci(game);
    const seq = getLongestSequence(game);

    const results = {
        reps: reps,
        pares: evens,
        primos: primes,
        fib: fib,
        seq: seq,
        pass: true,
        details: []
    };

    const hasLastResult = lastResult && lastResult.length > 0;

    if (filters.repsEnabled && hasLastResult && (reps < 8 || reps > 10)) results.pass = false;
    if (filters.evensEnabled && (evens < 6 || evens > 8)) results.pass = false;
    if (filters.primesEnabled && (primes < 4 || primes > 6)) results.pass = false;
    if (filters.fibEnabled && (fib < 3 || fib > 5)) results.pass = false;
    if (filters.seqEnabled && (seq < 3 || seq > 5)) results.pass = false;

    return results;
}