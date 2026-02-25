import { DatesCalculator } from './DatesCalculator';
import { DataSetConstants } from './DataSetConstants';

// Helper mock types instead of Android Context
export type NumerologyContext = {
    language: string;
    dateOfBirth: string; // MM/DD/YYYY format based on Java source split("/") logic, but could be DD/MM/YYYY. The original split is date.split("/")[0] = day, [1] = month, [2] = year. So DD/MM/YYYY.
    partnerDateOfBirth?: string;
    firstName: string;
    lastName: string;
    fatherName?: string;
    weddingDay?: string;
};

export class NumbersCalculator {

    static calcDailyBioRhytm(day: number, month: number, year: number): number[] {
        const rhytms = new Array(3).fill(0);
        const days = DatesCalculator.calcDaysAfterBorn(day, month, year);
        rhytms[0] = Math.sin(2 * Math.PI * days / 23) * 100;
        rhytms[1] = Math.sin(2 * Math.PI * days / 28) * 100;
        rhytms[2] = Math.sin(2 * Math.PI * days / 33) * 100;
        for (let i = 0; i < rhytms.length; i++) {
            if (rhytms[i] < 0 && rhytms[i] > -0.1) {
                rhytms[i] = 0;
            }
        }
        return rhytms;
    }

    static calcDailyBioRhytmAdditional(day: number, month: number, year: number): number[] {
        const rhytms = new Array(4).fill(0);
        const days = DatesCalculator.calcDaysAfterBorn(day, month, year);
        rhytms[0] = Math.sin(2 * Math.PI * days / 53) * 100;
        rhytms[1] = Math.sin(2 * Math.PI * days / 48) * 100;
        rhytms[2] = Math.sin(2 * Math.PI * days / 43) * 100;
        rhytms[3] = Math.sin(2 * Math.PI * days / 38) * 100;
        for (let i = 0; i < rhytms.length; i++) {
            if (rhytms[i] < 0 && rhytms[i] > -0.1) {
                rhytms[i] = 0;
            }
        }
        return rhytms;
    }

    static calcCompBioRhytm(myself: number[], spouse: number[]): number[] {
        const rhytms = new Array(3).fill(0);
        const days = DatesCalculator.calcDaysBetweenCouples(myself, spouse);
        rhytms[0] = Math.abs(Math.cos(Math.PI * days / 23) * 100);
        rhytms[1] = Math.abs(Math.cos(Math.PI * days / 28) * 100);
        rhytms[2] = Math.abs(Math.cos(Math.PI * days / 33) * 100);
        return rhytms;
    }

    static calcNextDayBioRhytm(day: number, month: number, year: number): number[] {
        const rhytms = new Array(3).fill(0);
        const days = DatesCalculator.calcDaysAfterBorn(day, month, year) + 1;
        rhytms[0] = Math.sin(2 * Math.PI * days / 23) * 100;
        rhytms[1] = Math.sin(2 * Math.PI * days / 28) * 100;
        rhytms[2] = Math.sin(2 * Math.PI * days / 33) * 100;
        return rhytms;
    }

    static calcCoupleNumber(context: NumerologyContext): number {
        const dateParts = context.dateOfBirth.split("/");
        const couple1 = dateParts[0] + dateParts[1] + dateParts[2];
        const coupleNumber1 = NumbersCalculator.calcToSingleDigit(parseInt(couple1, 10));

        if (!context.partnerDateOfBirth) return coupleNumber1;

        const partnerParts = context.partnerDateOfBirth.split("/");
        const couple2 = partnerParts[0] + partnerParts[1] + partnerParts[2];
        const coupleNumber2 = NumbersCalculator.calcToSingleDigit(parseInt(couple2, 10));

        return NumbersCalculator.calcToSingleDigit(coupleNumber1 + coupleNumber2);
    }

    static calcLifeNumberMethod1(context: NumerologyContext): number {
        const dateParts = context.dateOfBirth.split("/");
        let lifeNumberDay = parseInt(dateParts[0], 10);
        let lifeNumberMonth = parseInt(dateParts[1], 10);
        let lifeNumberYear = parseInt(dateParts[2], 10);

        lifeNumberDay = NumbersCalculator.calcToSingleDigitWithMagicNums(lifeNumberDay);
        lifeNumberMonth = NumbersCalculator.calcToSingleDigitWithMagicNums(lifeNumberMonth);
        lifeNumberYear = NumbersCalculator.calcToSingleDigitWithMagicNums(lifeNumberYear);

        return NumbersCalculator.calcToSingleDigitWithMagicNums(lifeNumberDay + lifeNumberMonth + lifeNumberYear);
    }

    static calcLifeNumberPartner(context: NumerologyContext): number {
        if (!context.partnerDateOfBirth) return 0;
        const dateParts = context.partnerDateOfBirth.split("/");
        let lifeNumberDay = parseInt(dateParts[0], 10);
        let lifeNumberMonth = parseInt(dateParts[1], 10);
        let lifeNumberYear = parseInt(dateParts[2], 10);

        lifeNumberDay = NumbersCalculator.calcToSingleDigitWithMagicNums(lifeNumberDay);
        lifeNumberMonth = NumbersCalculator.calcToSingleDigitWithMagicNums(lifeNumberMonth);
        lifeNumberYear = NumbersCalculator.calcToSingleDigitWithMagicNums(lifeNumberYear);

        return NumbersCalculator.calcToSingleDigitWithMagicNums(lifeNumberDay + lifeNumberMonth + lifeNumberYear);
    }

    static calcLuckyDailyNumber(context: NumerologyContext, addValue: number = 0): number {
        const luckyNum = NumbersCalculator.calcPersonalDay(context, addValue) + NumbersCalculator.calcLifeNumberMethod1(context);
        return NumbersCalculator.calcToSingleDigit(luckyNum);
    }

    static calcExpressionNumber(context: NumerologyContext): number {
        const nameChars = context.firstName.toLowerCase().split('');
        const lastNameChars = context.lastName.toLowerCase().split('');
        let middleNameChars: string[] = [];

        let nameNum = 0, lastNameNum = 0, middleNameNum = 0;
        let expressionNumber = 0;

        if (context.language === "ru") {
            middleNameChars = (context.fatherName || "").trim().toLowerCase().split('');

            nameNum = NumbersCalculator.convertCharsAndSum(nameChars, context);
            nameNum = NumbersCalculator.calcNumToDigits(nameNum);
            nameNum = NumbersCalculator.calcNumToDigits(nameNum);

            lastNameNum = NumbersCalculator.convertCharsAndSum(lastNameChars, context);
            lastNameNum = NumbersCalculator.calcNumToDigits(lastNameNum);
            lastNameNum = NumbersCalculator.calcNumToDigits(lastNameNum);

            middleNameNum = NumbersCalculator.convertCharsAndSum(middleNameChars, context);
            middleNameNum = NumbersCalculator.calcNumToDigits(middleNameNum);
            middleNameNum = NumbersCalculator.calcNumToDigits(middleNameNum);

            expressionNumber = NumbersCalculator.calcToSingleDigit(nameNum + lastNameNum + middleNameNum);

        } else {
            nameNum = NumbersCalculator.convertCharsAndSum(nameChars, context);
            nameNum = NumbersCalculator.calcNumToDigits(nameNum);
            nameNum = NumbersCalculator.calcNumToDigits(nameNum);

            lastNameNum = NumbersCalculator.convertCharsAndSum(lastNameChars, context);
            lastNameNum = NumbersCalculator.calcNumToDigits(lastNameNum);
            lastNameNum = NumbersCalculator.calcNumToDigits(lastNameNum);

            if (context.fatherName && context.fatherName.trim() !== '') {
                middleNameChars = context.fatherName.trim().toLowerCase().split('');
                middleNameNum = NumbersCalculator.convertCharsAndSum(middleNameChars, context);
                middleNameNum = NumbersCalculator.calcNumToDigits(middleNameNum);
                middleNameNum = NumbersCalculator.calcNumToDigits(middleNameNum);
            }

            expressionNumber = NumbersCalculator.calcNumToDigits(nameNum + lastNameNum + middleNameNum);
            expressionNumber = NumbersCalculator.calcToSingleDigitWithMagicNums(expressionNumber);
        }

        return expressionNumber;
    }

    static calcPersonalityNumber(context: NumerologyContext): number {
        const nameChars = context.firstName.toLowerCase().split('');
        const lastNameChars = context.lastName.toLowerCase().split('');
        let middleNameChars: string[] = [];

        let isStop = false;
        let nameNum = 0, lastNameNum = 0, middleNameNum = 0;
        let personalityNumber = 0;

        if (context.language === "ru") {
            middleNameChars = (context.fatherName || "").trim().toLowerCase().split('');
            nameNum = NumbersCalculator.convertConCharsAndSum(nameChars);
            nameNum = NumbersCalculator.calcToSingleDigit(nameNum);

            lastNameNum = NumbersCalculator.convertConCharsAndSum(lastNameChars);
            lastNameNum = NumbersCalculator.calcToSingleDigit(lastNameNum);

            middleNameNum = NumbersCalculator.convertConCharsAndSum(middleNameChars);
            middleNameNum = NumbersCalculator.calcToSingleDigit(middleNameNum);

            personalityNumber = nameNum + lastNameNum + middleNameNum;
            while (!isStop) {
                if (personalityNumber === 11 || personalityNumber === 22 || personalityNumber < 10) {
                    isStop = true;
                } else {
                    personalityNumber = NumbersCalculator.calcNumToDigits(personalityNumber);
                }
            }

        } else {
            nameNum = NumbersCalculator.convertConCharsAndSum(nameChars);
            nameNum = NumbersCalculator.calcToSingleDigit(nameNum);

            lastNameNum = NumbersCalculator.convertConCharsAndSum(lastNameChars);
            lastNameNum = NumbersCalculator.calcToSingleDigit(lastNameNum);

            if (context.fatherName && context.fatherName.trim() !== '') {
                middleNameChars = context.fatherName.trim().toLowerCase().split('');
                middleNameNum = NumbersCalculator.convertConCharsAndSum(middleNameChars);
                middleNameNum = NumbersCalculator.calcToSingleDigit(middleNameNum);
                personalityNumber = nameNum + lastNameNum + middleNameNum;
            } else {
                personalityNumber = nameNum + lastNameNum;
            }

            while (!isStop) {
                if (personalityNumber === 11 || personalityNumber === 22 || personalityNumber < 10) {
                    isStop = true;
                } else {
                    personalityNumber = NumbersCalculator.calcNumToDigits(personalityNumber);
                }
            }
        }
        return personalityNumber;
    }

    static calcKarmaNumber(context: NumerologyContext): number[] {
        const name = context.firstName.toLowerCase();
        const middleName = (context.fatherName || "").trim();
        const lastName = context.lastName.toLowerCase();
        const fullName = name + middleName + lastName;

        const full = fullName.split('');
        const letters: number[] = new Array(fullName.length).fill(0);
        const finalArray: number[] = new Array(10).fill(0);

        const lookup = DataSetConstants.getLetterToNumber();

        let j = 0;
        for (const letter of full) {
            const val = lookup[letter as keyof typeof lookup];
            letters[j] = val !== undefined ? val : 0;
            j++;
        }

        for (let k = 0; k < finalArray.length; k++) {
            let count = 0;
            for (const letter of letters) {
                if (letter === k) {
                    count++;
                }
            }
            finalArray[k] = count;
        }
        return finalArray;
    }

    static calcDestinyNumber(context: NumerologyContext): number {
        const nameChars = context.firstName.toLowerCase().split('');
        const middleNameChars = (context.fatherName || "").trim().toLowerCase().split('');
        const lastNameChars = context.lastName.toLowerCase().split('');

        let isStop = false;
        let destinyNumber = 0;

        let nameNum = NumbersCalculator.calcToSingleDigit(NumbersCalculator.convertConCharsAndSum(nameChars));
        let nameNumVow = NumbersCalculator.calcToSingleDigit(NumbersCalculator.convertVowCharsAndSum(nameChars, context));

        let lastNameNum = NumbersCalculator.calcToSingleDigit(NumbersCalculator.convertConCharsAndSum(lastNameChars));
        let lastNameNumVow = NumbersCalculator.calcToSingleDigit(NumbersCalculator.convertVowCharsAndSum(lastNameChars, context));

        let middleNameNum = NumbersCalculator.calcToSingleDigit(NumbersCalculator.convertConCharsAndSum(middleNameChars));
        let middleNameNumVow = NumbersCalculator.calcToSingleDigit(NumbersCalculator.convertVowCharsAndSum(middleNameChars, context));

        destinyNumber = nameNum + nameNumVow + lastNameNumVow + lastNameNum + middleNameNum + middleNameNumVow;
        while (!isStop) {
            if (destinyNumber === 11 || destinyNumber === 22 || destinyNumber < 10) {
                isStop = true;
            } else {
                destinyNumber = NumbersCalculator.calcNumToDigits(destinyNumber);
            }
        }

        return destinyNumber;
    }

    static calcPotencialNumber(context: NumerologyContext): number {
        const birthCode = NumbersCalculator.calcBirthdayCode(context);
        const destinyNum = NumbersCalculator.calcDestinyNumber(context);
        return NumbersCalculator.calcToSingleDigitWithMagicNums(birthCode + destinyNum);
    }

    static calcNameNumber(context: NumerologyContext): number {
        let name = '';
        let isStop = false;
        let nameNum = 0;
        let nameNumber = 0;

        if (context.language === "ru") {
            name = context.firstName.toLowerCase() + (context.fatherName || "").trim().toLowerCase() + context.lastName.toLowerCase();
            nameNum = NumbersCalculator.convertCharsAndSum(name.split(''), context);
            while (!isStop) {
                if (nameNum === 11 || nameNum === 22 || nameNum < 10) {
                    nameNumber = nameNum;
                    isStop = true;
                } else {
                    nameNum = NumbersCalculator.calcNumToDigits(nameNum);
                }
            }
        } else {
            if (!context.fatherName || context.fatherName.trim() === '') {
                name = context.firstName.toLowerCase() + context.lastName.toLowerCase();
            } else {
                name = context.firstName.toLowerCase() + context.fatherName.trim().toLowerCase() + context.lastName.toLowerCase();
            }

            nameNum = NumbersCalculator.convertCharsAndSum(name.split(''), context);
            while (!isStop) {
                if (nameNum < 10) {
                    nameNumber = nameNum;
                    isStop = true;
                } else {
                    nameNum = NumbersCalculator.calcNumToDigits(nameNum);
                }
            }
        }
        return nameNumber;
    }

    static calcRealizationNumber(context: NumerologyContext): number {
        const realizationNumber = NumbersCalculator.calcLifeNumberMethod1(context) + NumbersCalculator.calcExpressionNumber(context);
        return NumbersCalculator.calcToSingleDigitWithMagicNums(realizationNumber);
    }

    static calcIntelligenceNumber(context: NumerologyContext): number {
        const nameChars = context.firstName.toLowerCase().split('');
        const dayChars = context.dateOfBirth.split("/")[0].split('');

        let nameNum = NumbersCalculator.convertCharsAndSum(nameChars, context);
        nameNum = NumbersCalculator.calcToSingleDigit(nameNum);

        let dayNum = NumbersCalculator.charToNumber(dayChars);
        dayNum = NumbersCalculator.calcToSingleDigit(dayNum);

        return NumbersCalculator.calcToSingleDigit(dayNum + nameNum);
    }

    static calcBalanceNumber(context: NumerologyContext): number {
        const name = context.firstName.toLowerCase() + (context.fatherName || "").toLowerCase().trim() + context.lastName.toLowerCase();
        return NumbersCalculator.calcToSingleDigitWithMagicNums(name.length);
    }

    static calcSoulNumber(context: NumerologyContext): number {
        const dayChars = context.dateOfBirth.split("/")[0].split('');
        return NumbersCalculator.calcToSingleDigitWithMagicNums(NumbersCalculator.charToNumber(dayChars));
    }

    static calcSoulNumberLetters(context: NumerologyContext): number {
        const nameChars = context.firstName.toLowerCase().split('');
        const lastNameChars = context.lastName.toLowerCase().split('');

        let isStop = false;
        let soulNumber = 0;

        const nameNum = NumbersCalculator.convertVowCharsAndSum(nameChars, context);
        const lastNameNum = NumbersCalculator.convertVowCharsAndSum(lastNameChars, context);

        if (context.fatherName && context.fatherName.trim() !== '') {
            const middleNameChars = context.fatherName.trim().toLowerCase().split('');
            const middleNameNum = NumbersCalculator.convertVowCharsAndSum(middleNameChars, context);
            soulNumber = nameNum + lastNameNum + middleNameNum;
        } else {
            soulNumber = nameNum + lastNameNum;
        }

        while (!isStop) {
            if (soulNumber === 11 || soulNumber === 22 || soulNumber < 10) {
                isStop = true;
            } else {
                soulNumber = NumbersCalculator.calcNumToDigits(soulNumber);
            }
        }
        return soulNumber;
    }

    static calcCharacterNumber(context: NumerologyContext): number {
        const dayChars = context.dateOfBirth.split("/")[0].split('');
        return NumbersCalculator.calcToSingleDigitWithMagicNums(NumbersCalculator.charToNumber(dayChars));
    }

    static calcMoneyNumber(context: NumerologyContext): number {
        const dateParts = context.dateOfBirth.split("/");
        const dayChars = dateParts[0].split('');
        const monthChars = dateParts[1].split('');

        return NumbersCalculator.calcToSingleDigit(
            NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(dayChars)) +
            NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(monthChars))
        );
    }

    static calcBirthdayCode(context: NumerologyContext): number {
        const dateParts = context.dateOfBirth.split("/");
        const lifeNumberDay = NumbersCalculator.charToNumber(dateParts[0].split(''));
        const lifeNumberMonth = NumbersCalculator.charToNumber(dateParts[1].split(''));
        const lifeNumberYear = NumbersCalculator.charToNumber(dateParts[2].split(''));

        const brthCodeNumber = lifeNumberDay + lifeNumberMonth + lifeNumberYear;
        if (context.language === "ru") {
            return NumbersCalculator.calcToSingleDigitWithMagicNums(brthCodeNumber);
        } else {
            return NumbersCalculator.calcToSingleDigit(brthCodeNumber);
        }
    }

    static calcLuckyGem(context: NumerologyContext): number {
        const luckyGem = parseInt(context.dateOfBirth.split("/")[0], 10);
        return NumbersCalculator.calcToSingleDigit(luckyGem);
    }

    static calcBirthdayNumber(context: NumerologyContext): number {
        return parseInt(context.dateOfBirth.split("/")[0], 10);
    }

    static calcMaturityNumber(context: NumerologyContext): number {
        const maturityNumber = NumbersCalculator.calcLifeNumberMethod1(context) + NumbersCalculator.calcExpressionNumber(context);
        if (context.language === "ru") {
            return NumbersCalculator.calcToSingleDigit(maturityNumber);
        } else {
            return NumbersCalculator.calcToSingleDigitWithMagicNums(maturityNumber);
        }
    }

    static calcPersonalYear(context: NumerologyContext, addValue: number = 0): number {
        const dateParts = context.dateOfBirth.split("/");
        let yearNum = new Date().getFullYear() + addValue;
        let dayNum = NumbersCalculator.charToNumber(dateParts[0].split(''));
        let monthNum = NumbersCalculator.charToNumber(dateParts[1].split(''));

        yearNum = NumbersCalculator.calcToSingleDigitWithMagicNums(yearNum);
        dayNum = NumbersCalculator.calcToSingleDigitWithMagicNums(dayNum);
        monthNum = NumbersCalculator.calcToSingleDigitWithMagicNums(monthNum);

        return NumbersCalculator.calcToSingleDigit(dayNum + monthNum + yearNum);
    }

    static calcPersonalMonth(context: NumerologyContext, addValue: number = 0): number {
        const year = NumbersCalculator.calcPersonalYear(context);
        const d = new Date();
        d.setMonth(d.getMonth() + addValue);
        const month = d.getMonth() + 1; // 0-indexed in JS
        return NumbersCalculator.calcToSingleDigit(year + month);
    }

    static calcMarriageNumber(context: NumerologyContext): number {
        return NumbersCalculator.calcToSingleDigit(NumbersCalculator.calcRealizationNumber(context));
    }

    static calcPersonalDay(context: NumerologyContext, i: number = 0): number {
        const month = NumbersCalculator.calcPersonalMonth(context);
        const d = new Date();
        d.setDate(d.getDate() + i);
        const day = d.getDate();
        return NumbersCalculator.calcToSingleDigit(month + day);
    }

    static calcDesireNumber(context: NumerologyContext): number {
        const nameChars = context.firstName.toLowerCase().split('');
        const lastNameChars = context.lastName.toLowerCase().split('');

        let nameNum = NumbersCalculator.convertConCharsAndSum(nameChars);
        nameNum = NumbersCalculator.calcToSingleDigitWithMagicNums(nameNum);

        let lastNameNum = NumbersCalculator.convertConCharsAndSum(lastNameChars);
        lastNameNum = NumbersCalculator.calcToSingleDigitWithMagicNums(lastNameNum);

        return NumbersCalculator.calcToSingleDigitWithMagicNums(nameNum + lastNameNum);
    }

    static calcAchievmentPeriod(context: NumerologyContext): number {
        return NumbersCalculator.calcToSingleDigit(NumbersCalculator.calcLifeNumberMethod1(context));
    }

    static calcChallengeNumber1(context: NumerologyContext): number {
        const dateParts = context.dateOfBirth.split("/");
        const dayChars = dateParts[0].split('');
        const monthChars = dateParts[1].split('');
        const m = NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(monthChars));
        return Math.abs(NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(dayChars)) - m);
    }

    static calcChallengeNumber2(context: NumerologyContext): number {
        const dateParts = context.dateOfBirth.split("/");
        const dayChars = dateParts[0].split('');
        const yearChars = dateParts[2].split('');
        return Math.abs(
            NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(dayChars)) -
            NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(yearChars))
        );
    }

    static calcChallengeNumber3(context: NumerologyContext): number {
        return Math.abs(NumbersCalculator.calcChallengeNumber1(context) - NumbersCalculator.calcChallengeNumber2(context));
    }

    static calcChallengeNumber4(context: NumerologyContext): number {
        const dateParts = context.dateOfBirth.split("/");
        const yearChars = dateParts[2].split('');
        const monthChars = dateParts[1].split('');
        const m = NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(monthChars));
        return Math.abs(NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(yearChars)) - m);
    }

    static calcAchievmentNumber1(context: NumerologyContext): number {
        const dateParts = context.dateOfBirth.split("/");
        const dayChars = dateParts[0].split('');
        const monthChars = dateParts[1].split('');
        return NumbersCalculator.calcToSingleDigit(
            NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(dayChars)) +
            NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(monthChars))
        );
    }

    static calcAchievmentNumber2(context: NumerologyContext): number {
        const dateParts = context.dateOfBirth.split("/");
        const dayChars = dateParts[0].split('');
        const yearChars = dateParts[2].split('');
        return NumbersCalculator.calcToSingleDigit(
            NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(dayChars)) +
            NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(yearChars))
        );
    }

    static calcAchievmentNumber3(context: NumerologyContext): number {
        return NumbersCalculator.calcToSingleDigit(
            NumbersCalculator.calcAchievmentNumber1(context) + NumbersCalculator.calcAchievmentNumber2(context)
        );
    }

    static calcAchievmentNumber4(context: NumerologyContext): number {
        const dateParts = context.dateOfBirth.split("/");
        const yearChars = dateParts[2].split('');
        const monthChars = dateParts[1].split('');
        return NumbersCalculator.calcToSingleDigit(
            NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(yearChars)) +
            NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(monthChars))
        );
    }

    static calcPartnerLoveNumber(day: number, month: number): number {
        return NumbersCalculator.calcToSingleDigit(
            NumbersCalculator.calcToSingleDigit(day) + NumbersCalculator.calcToSingleDigit(month)
        );
    }

    static calcLoveCompatibilityNum(day: number, month: number, year: number, context: NumerologyContext): number {
        day = NumbersCalculator.calcToSingleDigitWithMagicNums(day);
        month = NumbersCalculator.calcToSingleDigitWithMagicNums(month);
        year = NumbersCalculator.calcToSingleDigitWithMagicNums(year);

        let number = NumbersCalculator.calcToSingleDigitWithMagicNums(day + month + year);
        number = number + NumbersCalculator.calcLifeNumberMethod1(context);
        return NumbersCalculator.calcToSingleDigit(number);
    }

    static calcPythagorosSquare(context: NumerologyContext, dob: string): number[] {
        // Assume dob is 'MM/DD/YYYY' based on context usages
        const dateParts = context.dateOfBirth.split("/");
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);

        const helpArray = new Array(4).fill(0);
        const array = new Array(9).fill(0);

        helpArray[0] = NumbersCalculator.calcNumToDigits(day) + NumbersCalculator.calcNumToDigits(month) + NumbersCalculator.calcNumToDigits(year);
        helpArray[1] = NumbersCalculator.calcNumToDigits(helpArray[0]);

        if (day > 9) {
            helpArray[2] = Math.abs(helpArray[0] - (Math.floor(day / 10) * 2));
        } else {
            helpArray[2] = Math.abs(helpArray[0] - (day * 2));
        }

        helpArray[3] = NumbersCalculator.calcNumToDigits(helpArray[2]);
        let helpNum = "" + day + month + year + helpArray[0] + helpArray[1] + helpArray[2] + helpArray[3];
        helpNum = helpNum.replace(/0/g, "");

        for (const single of helpNum.split('')) {
            const helping = parseInt(single, 10);
            if (!isNaN(helping) && helping > 0 && helping <= 9) {
                if (array[helping - 1] === 0) {
                    array[helping - 1] = helping;
                } else {
                    const helpSingle = "" + array[helping - 1] + helping;
                    array[helping - 1] = parseInt(helpSingle, 10);
                }
            }
        }
        return array;
    }

    static calcWeddingNumber(context: NumerologyContext): number {
        if (!context.weddingDay) return 0;
        const dateParts = context.weddingDay.split("/");
        const yearChars = dateParts[2].split('');
        const monthChars = dateParts[1].split('');
        const dayChars = dateParts[0].split('');

        const m = NumbersCalculator.calcToSingleDigit(NumbersCalculator.charToNumber(monthChars));
        return NumbersCalculator.calcToSingleDigit(
            NumbersCalculator.charToNumber(dayChars) + NumbersCalculator.charToNumber(yearChars) + m
        );
    }


    /* --- Helpers (Private in Java) --- */

    static calcNumToDigits(number: number): number {
        let sum = 0;
        let num = Math.abs(Math.floor(number));
        while (num > 0) {
            sum = sum + (num % 10);
            num = Math.floor(num / 10);
        }
        return sum;
    }

    static charToNumber(digits: string[]): number {
        let lifeNumber = 0;
        for (const digit of digits) {
            const val = parseInt(digit, 10);
            if (!isNaN(val)) {
                lifeNumber = lifeNumber + val;
            }
        }
        return lifeNumber;
    }

    static convertCharsAndSum(letters: string[], context: NumerologyContext): number {
        let num = 0;
        const lookup = DataSetConstants.getLetterToNumber();
        const isDe = context.language === "de";

        for (const letter of letters) {
            let letVal = 0;
            if (isDe && letter === 'ü') {
                letVal = 8;
            } else if (isDe && letter === 'ä') {
                letVal = 6;
            } else {
                letVal = lookup[letter as keyof typeof lookup] || 0;
            }
            num = num + letVal;
        }
        return num;
    }

    static convertConCharsAndSum(letters: string[]): number {
        let num = 0;
        const lookup = DataSetConstants.getConLetterToNumber();
        for (const letter of letters) {
            const letVal = lookup[letter as keyof typeof lookup] || 0;
            num = num + letVal;
        }
        return num;
    }

    static convertVowCharsAndSum(letters: string[], context: NumerologyContext): number {
        let num = 0;
        const lookup = DataSetConstants.getVowLetterToNumber();
        const isDe = context.language === "de";

        for (const letter of letters) {
            if (isDe && letter === 'ü') {
                num = num + 8;
            } else if (isDe && letter === 'ä') {
                num = num + 6;
            } else {
                num = num + (lookup[letter as keyof typeof lookup] || 0);
            }
        }
        return num;
    }

    static calcToSingleDigit(number: number): number {
        let isStop = false;
        let result = number;
        while (!isStop) {
            if (result < 10) {
                isStop = true;
            } else {
                result = NumbersCalculator.calcNumToDigits(result);
            }
        }
        return result;
    }

    static calcToSingleDigitWithMagicNums(number: number): number {
        let isStop = false;
        let result = number;
        while (!isStop) {
            if (result === 11 || result === 22 || result < 10) {
                isStop = true;
            } else {
                result = NumbersCalculator.calcNumToDigits(result);
            }
        }
        return result;
    }
}
