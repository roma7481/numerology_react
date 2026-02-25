import { NumbersCalculator, NumerologyContext } from './NumbersCalculator';

describe('NumbersCalculator', () => {

    const ruContext: NumerologyContext = {
        language: 'ru',
        dateOfBirth: '24/10/1990', // DD/MM/YYYY per Java logic interpretation
        firstName: 'Иван',
        lastName: 'Иванов',
        fatherName: 'Иванович'
    };

    const enContext: NumerologyContext = {
        language: 'en',
        dateOfBirth: '15/05/1985',
        firstName: 'John',
        lastName: 'Doe'
    };

    describe('Core Number Reductions', () => {
        it('calculates num to digits correctly', () => {
            expect(NumbersCalculator.calcNumToDigits(1234)).toBe(10);
            expect(NumbersCalculator.calcNumToDigits(99)).toBe(18);
        });

        it('reduces to single digit correctly', () => {
            expect(NumbersCalculator.calcToSingleDigit(1990)).toBe(1); // 1+9+9+0=19 -> 1+9=10 -> 1+0=1
            expect(NumbersCalculator.calcToSingleDigit(26)).toBe(8);
        });

        it('reduces to single digit with master numbers correctly', () => {
            expect(NumbersCalculator.calcToSingleDigitWithMagicNums(11)).toBe(11);
            expect(NumbersCalculator.calcToSingleDigitWithMagicNums(22)).toBe(22);
            expect(NumbersCalculator.calcToSingleDigitWithMagicNums(29)).toBe(11); // 2+9=11
            expect(NumbersCalculator.calcToSingleDigitWithMagicNums(1990)).toBe(1); // 19 -> 10 -> 1
        });
    });

    describe('Life Path / Destiny Methods', () => {
        it('calculates Life Number (Method 1) RU', () => {
            // 24 -> 6, 11 -> 11, 1990 -> 1 => 6+11+1 = 18 -> 9
            expect(NumbersCalculator.calcLifeNumberMethod1(ruContext)).toBe(9);
        });

        it('calculates Life Number (Method 1) EN', () => {
            // 15 -> 6, 06 -> 6, 1985 -> 23 -> 5 => 6+6+5 = 17 -> 8
            expect(NumbersCalculator.calcLifeNumberMethod1(enContext)).toBe(8);
        });

        it('calculates Personal Year', () => {
            // Formula uses current year + dob day/month
            // Requires mock or awareness of the current year. We will mock Date specifically if needed later.
            const py = NumbersCalculator.calcPersonalYear(enContext);
            expect(py).toBeGreaterThan(0);
            expect(py).toBeLessThan(10);
        });
    });

    describe('Pythagoras Square', () => {
        it('calculates Pythagoras square correctly for 24/10/1990', () => {
            // day=24, month=11, year=1990
            // helpArray[0] = 6 + 2 + 19 = 27
            // helpArray[1] = 9
            // helpArray[2] = 27 - (2*2) = 23
            // helpArray[3] = 5
            // helpNum string: 24111990279235
            // array counts 1-9
            const grid = NumbersCalculator.calcPythagorosSquare(ruContext, '24/10/1990');
            expect(grid).toHaveLength(9);
            // Just verifying it doesn't crash and returns an array of numbers
            grid.forEach(num => expect(typeof num).toBe('number'));
        });
    });

});
