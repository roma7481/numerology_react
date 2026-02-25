package numerology.dailymistika.ru.calc;

import android.content.Context;

import java.util.Arrays;
import java.util.Calendar;

import numerology.dailymistika.ru.LanguageController;
import numerology.dailymistika.ru.metadata.Constants;
import numerology.dailymistika.ru.misc.AppPreferences;

import static java.lang.Math.cos;
import static java.lang.Math.sin;

public class NumbersCalculator {


    public static float[] calcDailyBioRhytm(int day, int month, int year) {
        float[] rhytms = new float[3];
        double days = DatesCalculator.calcDaysAfterBorn(day, month, year);
        rhytms[0] = (float) (sin(2d * Math.PI * (days) / 23d) * 100d);
        rhytms[1] = (float) (sin(2d * Math.PI * (days) / 28d) * 100d);
        rhytms[2] = (float) (sin(2d * Math.PI * (days) / 33d) * 100d);
        for (int i = 0; i < rhytms.length; i++) {
            if (rhytms[i] < 0 && rhytms[i] > -0.1) {
                rhytms[i] = 0;
            }
        }
        return rhytms;
    }

    public static float[] calcDailyBioRhytmAdditional(int day, int month, int year) {
        float[] rhytms = new float[4];
        double days = DatesCalculator.calcDaysAfterBorn(day, month, year);
        rhytms[0] = (float) (sin(2d * Math.PI * (days) / 53d) * 100d);
        rhytms[1] = (float) (sin(2d * Math.PI * (days) / 48d) * 100d);
        rhytms[2] = (float) (sin(2d * Math.PI * (days) / 43d) * 100d);
        rhytms[3] = (float) (sin(2d * Math.PI * (days) / 38d) * 100d);
        for (int i = 0; i < rhytms.length; i++) {
            if (rhytms[i] < 0 && rhytms[i] > -0.1) {
                rhytms[i] = 0;
            }
        }
        return rhytms;
    }

    public static float[] calcCompBioRhytm(int[] myself, int[] spouse) {
        float[] rhytms = new float[3];
        double days = DatesCalculator.calcDaysBetweenCouples(myself, spouse);
        rhytms[0] = Math.abs((float) (cos(Math.PI * (days) / 23d) * 100d));
        rhytms[1] = Math.abs((float) (cos(Math.PI * (days) / 28d) * 100d));
        rhytms[2] = Math.abs((float) (cos(Math.PI * (days) / 33d) * 100d));
        return rhytms;
    }

    public static float[] calcNextDayBioRhytm(int day, int month, int year) {
        float[] rhytms = new float[3];
        double days = DatesCalculator.calcDaysAfterBorn(day, month, year) + 1;
        rhytms[0] = (float) (sin(2d * Math.PI * (days) / 23d) * 100d);
        rhytms[1] = (float) (sin(2d * Math.PI * (days) / 28d) * 100d);
        rhytms[2] = (float) (sin(2d * Math.PI * (days) / 33d) * 100d);
        return rhytms;
    }

    public static int calcCoupleNumber(Context context) {
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        String couple1,couple2;
        String datePartner = AppPreferences.getValue(context, Constants.PARTNER_DATE_OF_BIRTH);
        int coupleNumber1, coupleNumber2;
        couple1 = date.split("/")[0] + (Integer.valueOf(date.split("/")[1]) + 1) + date.split("/")[2];
        coupleNumber1 = calcToSingleDigit(Integer.valueOf(couple1));

        couple2 = datePartner.split("/")[0] + (Integer.valueOf(datePartner.split("/")[1]) + 1) + datePartner.split("/")[2];
        coupleNumber2 = calcToSingleDigit(Integer.valueOf(couple2));

        return calcToSingleDigit(coupleNumber1 + coupleNumber2);
    }

    public static int calcLifeNumberMethod1(Context context) {
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        int lifeNumberDay, lifeNumberMonth, lifeNumberYear;
        boolean isStop = false;
        lifeNumberDay = Integer.valueOf(date.split("/")[0]);
        lifeNumberMonth = Integer.valueOf(date.split("/")[1]) + 1;
        lifeNumberYear = Integer.valueOf(date.split("/")[2]);

        lifeNumberDay = calcToSingleDigitWithMagicNums(lifeNumberDay);
        lifeNumberMonth = calcToSingleDigitWithMagicNums(lifeNumberMonth);
        lifeNumberYear = calcToSingleDigitWithMagicNums(lifeNumberYear);

        return calcToSingleDigitWithMagicNums(lifeNumberDay + lifeNumberMonth + lifeNumberYear);
    }

    public static int calcLifeNumberPartner(Context context) {
        String date = AppPreferences.getValue(context, Constants.PARTNER_DATE_OF_BIRTH);
        int lifeNumberDay, lifeNumberMonth, lifeNumberYear;
        lifeNumberDay = Integer.valueOf(date.split("/")[0]);
        lifeNumberMonth = Integer.valueOf(date.split("/")[1]) + 1;
        lifeNumberYear = Integer.valueOf(date.split("/")[2]);

        lifeNumberDay = calcToSingleDigitWithMagicNums(lifeNumberDay);
        lifeNumberMonth = calcToSingleDigitWithMagicNums(lifeNumberMonth);
        lifeNumberYear = calcToSingleDigitWithMagicNums(lifeNumberYear);

        return calcToSingleDigitWithMagicNums(lifeNumberDay + lifeNumberMonth + lifeNumberYear);
    }

    public static int calcLuckyDailyNumber(Context context) {
        int luckyNum = 0;
        luckyNum = calcPersonalDay(context) + calcLifeNumberMethod1(context);
        return calcToSingleDigit(luckyNum);
    }

    public static int calcLuckyDailyNumber(Context context,int addValue) {
        int luckyNum = 0;
        luckyNum = calcPersonalDay(context,addValue) + calcLifeNumberMethod1(context);
        return calcToSingleDigit(luckyNum);
    }

    public static int calcExpressionNumber(Context context) {
        char[] name;
        char[] lastName;
        char[] middleName;
        int nameNum = 0, lastNameNum = 0, middleNameNum = 0;
        int expressionNumber = 0;
        if (AppPreferences.getValue(context, Constants.LANGUAGE).equals("ru")) {
            name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase().toCharArray();
            middleName = AppPreferences.getValue(context, Constants.FATHER_NAME).trim().toLowerCase().toCharArray();
            lastName = AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase().toCharArray();
            nameNum = convertCharsAndSum(name,context);
            nameNum = calcNumToDigits(nameNum);
            nameNum = calcNumToDigits(nameNum);

            lastNameNum = convertCharsAndSum(lastName,context);
            lastNameNum = calcNumToDigits(lastNameNum);
            lastNameNum = calcNumToDigits(lastNameNum);

            middleNameNum = convertCharsAndSum(middleName,context);
            middleNameNum = calcNumToDigits(middleNameNum);
            middleNameNum = calcNumToDigits(middleNameNum);

            expressionNumber = calcToSingleDigit(nameNum + lastNameNum + middleNameNum);


        } else {
            name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase().toCharArray();
            lastName = AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase().toCharArray();


            nameNum = convertCharsAndSum(name,context);
            nameNum = calcNumToDigits(nameNum);
            nameNum = calcNumToDigits(nameNum);

            lastNameNum = convertCharsAndSum(lastName,context);
            lastNameNum = calcNumToDigits(lastNameNum);
            lastNameNum = calcNumToDigits(lastNameNum);

            if (!AppPreferences.getValue(context, Constants.FATHER_NAME).trim().isEmpty()) {
                middleName = AppPreferences.getValue(context, Constants.FATHER_NAME).trim().toLowerCase().toCharArray();
                middleNameNum = convertCharsAndSum(middleName,context);
                middleNameNum = calcNumToDigits(middleNameNum);
                middleNameNum = calcNumToDigits(middleNameNum);
            }


            expressionNumber = calcNumToDigits(nameNum + lastNameNum + middleNameNum);
            expressionNumber = calcToSingleDigitWithMagicNums(expressionNumber);

        }


        return expressionNumber;

    }

    public static int calcPersonalityNumber(Context context) {
        char[] name;
        char[] lastName;
        char[] middleName;
        boolean isStop = false;
        int nameNum = 0, lastNameNum = 0, middleNameNum = 0;
        int personalityNumber = 0;
        if (AppPreferences.getValue(context, Constants.LANGUAGE).equals("ru")) {
            name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase().toCharArray();
            middleName = AppPreferences.getValue(context, Constants.FATHER_NAME).trim().toLowerCase().toCharArray();
            lastName = AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase().toCharArray();
            nameNum = convertConCharsAndSum(name);
            nameNum = calcToSingleDigit(nameNum);
            lastNameNum = convertConCharsAndSum(lastName);
            lastNameNum = calcToSingleDigit(lastNameNum);
            middleNameNum = convertConCharsAndSum(middleName);
            middleNameNum = calcToSingleDigit(middleNameNum);

            personalityNumber = nameNum + lastNameNum + middleNameNum;
            while (!isStop) {
                if (personalityNumber == 11 || personalityNumber == 22 || personalityNumber < 10) {
                    isStop = true;
                } else {
                    personalityNumber = calcNumToDigits(personalityNumber);
                }
            }

        } else {
            name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase().toCharArray();
            lastName = AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase().toCharArray();


            nameNum = convertConCharsAndSum(name);
            nameNum = calcToSingleDigit(nameNum);

            lastNameNum = convertConCharsAndSum(lastName);
            lastNameNum = calcToSingleDigit(lastNameNum);

            if (!AppPreferences.getValue(context, Constants.FATHER_NAME).trim().isEmpty()) {
                middleName = AppPreferences.getValue(context, Constants.FATHER_NAME).trim().toLowerCase().toCharArray();
                middleNameNum = convertConCharsAndSum(middleName);
                middleNameNum = calcToSingleDigit(middleNameNum);
                personalityNumber = nameNum + lastNameNum + middleNameNum;
            } else {
                personalityNumber = nameNum + lastNameNum;
            }

            while (!isStop) {
                if (personalityNumber == 11 || personalityNumber == 22 || personalityNumber < 10) {
                    isStop = true;
                } else {
                    personalityNumber = calcNumToDigits(personalityNumber);
                }
            }

        }
        return personalityNumber;

    }

    public static int[] calcKarmaNumber(Context context) {
        String name;
        String lastName;
        String middleName;
        String fullName;
        char[] full;
        int[] letters;
        int[] finalArray = new int[10];
        int j=0;
        name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase();
        middleName = AppPreferences.getValue(context, Constants.FATHER_NAME).trim();
        lastName = AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase();
        fullName = name + middleName + lastName;
        letters = new int[fullName.length()];
        full = fullName.toCharArray();
        for (char letter : full) {
            try {
                letters[j] = DataSetConstants.getLetterToNumber().get(letter);
            } catch (NullPointerException e) {
                letters[j] = 0;
            }
            j++;
        }
        for(int k = 0; k < finalArray.length; k++){
            int count = 0;
            for (int letter : letters) {
                if (letter == k) {
                    count++;
                }
            }
            finalArray[k] = count;
        }
        return finalArray;
    }
    public static int calcDestinyNumber(Context context) {

        char[] name;
        char[] lastName;
        char[] middleName;
        boolean isStop = false;
        int nameNum = 0, lastNameNum = 0, middleNameNum = 0;
        int nameNumVow = 0, lastNameNumVow = 0, middleNameNumVow = 0;
        int destinyNumber = 0;
        name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase().toCharArray();
        middleName = AppPreferences.getValue(context, Constants.FATHER_NAME).trim().toLowerCase().toCharArray();
        lastName = AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase().toCharArray();

        nameNum = convertConCharsAndSum(name);
        nameNum = calcToSingleDigit(nameNum);
        nameNumVow = convertVowCharsAndSum(name,context);
        nameNumVow = calcToSingleDigit(nameNumVow);

        lastNameNum = convertConCharsAndSum(lastName);
        lastNameNum = calcToSingleDigit(lastNameNum);
        lastNameNumVow = convertVowCharsAndSum(lastName,context);
        lastNameNumVow = calcToSingleDigit(lastNameNumVow);

        middleNameNum = convertConCharsAndSum(middleName);
        middleNameNum = calcToSingleDigit(middleNameNum);
        middleNameNumVow = convertVowCharsAndSum(middleName,context);
        middleNameNumVow = calcToSingleDigit(middleNameNumVow);


        destinyNumber = nameNum + nameNumVow + lastNameNumVow + lastNameNum + middleNameNum + middleNameNumVow;
        while (!isStop) {
            if (destinyNumber == 11 || destinyNumber == 22 || destinyNumber < 10) {
                isStop = true;
            } else {
                destinyNumber = calcNumToDigits(destinyNumber);
            }
        }

        return destinyNumber;
    }

    public static int calcPotencialNumber(Context context) {
        int birthCode = calcBirthdayCode(context);
        int destinyNum = calcDestinyNumber(context);
        return calcToSingleDigitWithMagicNums(birthCode + destinyNum);

    }
    public static int calcNameNumber(Context context) {
        String name;
        boolean isStop = false;
        int nameNum = 0;
        int nameNumber = 0;
        if (AppPreferences.getValue(context, Constants.LANGUAGE).equals("ru")) {
            name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase() + AppPreferences.getValue(context, Constants.FATHER_NAME).trim().toLowerCase() + AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase();
            nameNum = convertCharsAndSum(name.toCharArray(),context);
            while (!isStop) {
                if (nameNum == 11 || nameNum == 22 || nameNum < 10) {
                    nameNumber = nameNum;
                    isStop = true;
                } else {
                    nameNum = calcNumToDigits(nameNum);
                }
            }

        } else {
            if (AppPreferences.getValue(context, Constants.FATHER_NAME).trim().isEmpty()) {
                name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase() + AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase();
            } else {

                name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase() + AppPreferences.getValue(context, Constants.FATHER_NAME).trim().toLowerCase() + AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase();
            }

            nameNum = convertCharsAndSum(name.toCharArray(),context);
            while (!isStop) {
                if (nameNum < 10) {
                    nameNumber = nameNum;
                    isStop = true;
                } else {
                    nameNum = calcNumToDigits(nameNum);
                }
            }

        }


        return nameNumber;

    }

    public static int calcRealizationNumber(Context context) {
        int realizationNumber = 0;
        realizationNumber = calcLifeNumberMethod1(context) + calcExpressionNumber(context);
        return calcToSingleDigitWithMagicNums(realizationNumber);
    }

    public static int calcIntelligenceNumber(Context context) {
        int intelligenceNumber = 0, nameNum, dayNum;
        char[] name;
        char[] day;
        name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase().toCharArray();
        day = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH).split("/")[0].toCharArray();

        nameNum = convertCharsAndSum(name,context);
        nameNum = calcToSingleDigit(nameNum);

        dayNum = charToNumber(day);
        dayNum = calcToSingleDigit(dayNum);

        intelligenceNumber = dayNum + nameNum;

        intelligenceNumber = calcToSingleDigit(intelligenceNumber);

        return intelligenceNumber;
    }

    public static int calcBalanceNumber(Context context) {
        String name;
        int balanceNumber = 0;

        name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase() + AppPreferences.getValue(context, Constants.FATHER_NAME).toLowerCase().trim() + AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase();
        balanceNumber = name.length();
        return calcToSingleDigitWithMagicNums(balanceNumber);

    }

    public static int calcSoulNumber(Context context) {
        char[] day;
        day = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH).split("/")[0].toCharArray();
        return calcToSingleDigitWithMagicNums(charToNumber(day));
    }
    public static int calcSoulNumberLetters(Context context) {
        char[] name;
        char[] lastName;
        char[] middleName;
        boolean isStop = false;
        int nameNum = 0, lastNameNum = 0, middleNameNum = 0;
        int soulNumber = 0;
            name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase().toCharArray();
            lastName = AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase().toCharArray();
            nameNum = convertVowCharsAndSum(name,context);
//            nameNum = calcToSingleDigit(nameNum);
            lastNameNum = convertVowCharsAndSum(lastName,context);
//            lastNameNum = calcToSingleDigit(lastNameNum);

            if (!AppPreferences.getValue(context, Constants.FATHER_NAME).trim().isEmpty()) {
                middleName = AppPreferences.getValue(context, Constants.FATHER_NAME).trim().toLowerCase().toCharArray();
                middleNameNum = convertVowCharsAndSum(middleName,context);
//                middleNameNum = calcToSingleDigit(middleNameNum);
                soulNumber = nameNum + lastNameNum + middleNameNum;
            } else {
                soulNumber = nameNum + lastNameNum;
            }

            while (!isStop) {
                if (soulNumber == 11 || soulNumber == 22 || soulNumber < 10) {
                    isStop = true;
                } else {
                    soulNumber = calcNumToDigits(soulNumber);
                }
            }

        return soulNumber;

    }

    public static int calcCharacterNumber(Context context) {
        char[] day;
        day = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH).split("/")[0].toCharArray();
        return calcToSingleDigitWithMagicNums(charToNumber(day));
    }

    public static int calcMoneyNumber(Context context) {
        char[] day;
        char[] month;
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        day = date.split("/")[0].toCharArray();
        month = date.split("/")[1].toCharArray();
        return calcToSingleDigit(calcToSingleDigit(charToNumber(day)) + calcToSingleDigit(charToNumber(month) + 1));
    }

    public static int calcBirthdayCode(Context context) {
        int brthCodeNumber = 0, lifeNumberDay = 0, lifeNumberMonth = 0, lifeNumberYear = 0;
        String date;
        date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        lifeNumberDay = charToNumber(date.split("/")[0].toCharArray());
        lifeNumberMonth = charToNumber(date.split("/")[1].toCharArray()) + 1;
        lifeNumberYear = charToNumber(date.split("/")[2].toCharArray());

        brthCodeNumber = lifeNumberDay + lifeNumberMonth + lifeNumberYear;
        if (AppPreferences.getValue(context, Constants.LANGUAGE).equals("ru"))
            return calcToSingleDigitWithMagicNums(brthCodeNumber);
        else
            return calcToSingleDigit(brthCodeNumber);
    }


    public static int calcLuckyGem(Context context) {
        int luckyGem = Integer.valueOf(AppPreferences.getValue(context, Constants.DATE_OF_BIRTH).split("/")[0]);
        return calcToSingleDigit(luckyGem);
    }

    public static int calcBirthdayNumber(Context context) {
        return Integer.valueOf(AppPreferences.getValue(context, Constants.DATE_OF_BIRTH).split("/")[0]);
    }

    public static int calcMaturityNumber(Context context) {
        int maturityNumber = calcLifeNumberMethod1(context) + calcExpressionNumber(context);
        if (AppPreferences.getValue(context, Constants.LANGUAGE).equals("ru"))
            return calcToSingleDigit(maturityNumber);
        else
            return calcToSingleDigitWithMagicNums(maturityNumber);

    }

    public static int calcPersonalYear(Context context) {
        int day, month, year;
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        Calendar cal = Calendar.getInstance();
        year = cal.get(Calendar.YEAR);
        day = charToNumber(date.split("/")[0].toCharArray());
        month = charToNumber(date.split("/")[1].toCharArray()) + 1;
        year = calcToSingleDigitWithMagicNums(year);
        day = calcToSingleDigitWithMagicNums(day);
        month = calcToSingleDigitWithMagicNums(month);

        return calcToSingleDigit(day + month + year);
    }

    public static int calcPersonalYear(Context context,int addValue) {
        int day, month, year;
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        Calendar cal = Calendar.getInstance();
        year = cal.get(Calendar.YEAR) + addValue;
        day = charToNumber(date.split("/")[0].toCharArray());
        month = charToNumber(date.split("/")[1].toCharArray()) + 1;
        year = calcToSingleDigitWithMagicNums(year);
        day = calcToSingleDigitWithMagicNums(day);
        month = calcToSingleDigitWithMagicNums(month);

        return calcToSingleDigit(day + month + year);
    }

    public static int calcPersonalMonth(Context context) {
        int year = calcPersonalYear(context);
        Calendar cal = Calendar.getInstance();
        int month = cal.get(Calendar.MONTH) + 1;
        return calcToSingleDigit(year + month);
    }
    public static int calcPersonalMonth(Context context,int addValue) {
        int year = calcPersonalYear(context);
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.MONTH,addValue);
        int month = cal.get(Calendar.MONTH) + 1;
        return calcToSingleDigit(year + month);
    }

    public static int calcMarriageNumber(Context context) {
        int marriageNum = calcRealizationNumber(context);
        return calcToSingleDigit(marriageNum);
    }

    public static int calcPersonalDay(Context context) {
        int month = calcPersonalMonth(context);
        Calendar cal = Calendar.getInstance();
        int day = cal.get(Calendar.DAY_OF_MONTH);
        return calcToSingleDigit(month + day);
    }

    public static int calcPersonalDay(Context context,int i) {
        int month = calcPersonalMonth(context);
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE,i);
        int day = cal.get(Calendar.DAY_OF_MONTH);
        return calcToSingleDigit(month + day);
    }

    public static int calcDesireNumber(Context context) {
        int nameNum, lastNameNum;
        char[] name;
        char[] lastName;

        name = AppPreferences.getValue(context, Constants.FIRST_NAME).toLowerCase().toCharArray();
        lastName = AppPreferences.getValue(context, Constants.LAST_NAME).toLowerCase().toCharArray();
        nameNum = convertConCharsAndSum(name);
        nameNum = calcToSingleDigitWithMagicNums(nameNum);

        lastNameNum = convertConCharsAndSum(lastName);
        lastNameNum = calcToSingleDigitWithMagicNums(lastNameNum);
        return calcToSingleDigitWithMagicNums(nameNum + lastNameNum);
    }

    public static int calcAchievmentPeriod(Context context) {
        return calcToSingleDigit(calcLifeNumberMethod1(context));
    }

    public static int calcChallengeNumber1(Context context) {
        char[] day;
        char[] month;
        int m;
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        day = date.split("/")[0].toCharArray();
        month = date.split("/")[1].toCharArray();
        m = calcToSingleDigit(charToNumber(month)) + 1;
        return Math.abs(calcToSingleDigit(charToNumber(day)) - m);
    }

    public static int calcChallengeNumber2(Context context) {
        char[] day;
        char[] year;
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        day = date.split("/")[0].toCharArray();
        year = date.split("/")[2].toCharArray();
        return Math.abs(calcToSingleDigit(charToNumber(day)) - calcToSingleDigit(charToNumber(year)));
    }

    public static int calcChallengeNumber3(Context context) {
        return Math.abs(calcChallengeNumber1(context) - calcChallengeNumber2(context));
    }

    public static int calcChallengeNumber4(Context context) {
        char[] year;
        char[] month;
        int m;
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        year = date.split("/")[2].toCharArray();
        month = date.split("/")[1].toCharArray();
        m = calcToSingleDigit(charToNumber(month)) + 1;
        return Math.abs(calcToSingleDigit(charToNumber(year)) - m);
    }

    public static int calcAchievmentNumber1(Context context) {
        char[] day;
        char[] month;
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        day = date.split("/")[0].toCharArray();
        month = date.split("/")[1].toCharArray();
        return calcToSingleDigit(calcToSingleDigit(charToNumber(day)) + calcToSingleDigit(charToNumber(month) + 1));
    }

    public static int calcAchievmentNumber2(Context context) {
        char[] day;
        char[] year;
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        day = date.split("/")[0].toCharArray();
        year = date.split("/")[2].toCharArray();
        return calcToSingleDigit(calcToSingleDigit(charToNumber(day)) + calcToSingleDigit(charToNumber(year)));
    }

    public static int calcAchievmentNumber3(Context context) {
        int ach3 = calcAchievmentNumber1(context) + calcAchievmentNumber2(context);
        return calcToSingleDigit(ach3);
    }

    public static int calcAchievmentNumber4(Context context) {
        char[] year;
        char[] month;
        String date = AppPreferences.getValue(context, Constants.DATE_OF_BIRTH);
        year = date.split("/")[2].toCharArray();
        month = date.split("/")[1].toCharArray();
        return calcToSingleDigit(calcToSingleDigit(charToNumber(year)) + calcToSingleDigit(charToNumber(month) + 1));
    }

    public static int calcPartnerLoveNumber(int day, int month) {
        return calcToSingleDigit(calcToSingleDigit(day) + calcToSingleDigit(month+1));
    }


    public static int calcLoveCompatibilityNum(int day, int month, int year, Context context) {
        int number;
        day = calcToSingleDigitWithMagicNums(day);
        month = calcToSingleDigitWithMagicNums(month + 1);
        year = calcToSingleDigitWithMagicNums(year);

        number = calcToSingleDigitWithMagicNums(day + month + year);

        number = number + calcLifeNumberMethod1(context);
        return calcToSingleDigit(number);
    }

    public static int[] calcPythagorosSquare(Context context, String dob) {
        int day;
        int month;
        int year;
        int helping;
        int helpYear = 0;
        String helpNum, helpSingle;
        int[] helpArray = new int[4];
        int[] array = {0, 0, 0, 0, 0, 0, 0, 0, 0};
        String date = AppPreferences.getValue(context, dob);
        day = Integer.valueOf(date.split("/")[0]);
        month = Integer.valueOf(date.split("/")[1]) + 1;
        year = Integer.valueOf(date.split("/")[2]);
//        if(year >= 2000){
//            helpYear =  year - 1999;
//            helpArray[0] = calcNumToDigits(day) + calcNumToDigits(month) + calcNumToDigits(1999)+ calcNumToDigits(helpYear);
//        }else
        helpArray[0] = calcNumToDigits(day) + calcNumToDigits(month) + calcNumToDigits(year);

        helpArray[1] = calcNumToDigits(helpArray[0]);
        if (day > 9) {
            helpArray[2] = Math.abs(helpArray[0] - ((int) (day / 10) * 2));
        } else {
            helpArray[2] = Math.abs(helpArray[0] - (day * 2));
        }
        helpArray[3] = calcNumToDigits(helpArray[2]);
        helpNum = "" + day + month + year + helpArray[0] + helpArray[1] + helpArray[2] + helpArray[3];
        helpNum = helpNum.replace("0", "");
        for (char single : helpNum.toCharArray()) {
            helping = Character.getNumericValue(single);
            if (array[helping - 1] == 0) {
                array[helping - 1] = helping;
            } else {
                helpSingle = "" + array[helping - 1] + helping;
                array[helping - 1] = Integer.valueOf(helpSingle);
            }
        }
        return array;
    }

    public static int calcWeddingNumber(Context context) {
        char[] day;
        char[] year;
        char[] month;
        int m;
        String date = AppPreferences.getValue(context, Constants.WEDDING_DAY);
        year = date.split("/")[2].toCharArray();
        month = date.split("/")[1].toCharArray();
        day = date.split("/")[0].toCharArray();
        m = calcToSingleDigit(charToNumber(month)) + 1;
        return calcToSingleDigit(charToNumber(day) + charToNumber(year) + m);
    }


    private static int calcNumToDigits(int number) {
        int sum = 0;
        while (number > 0) {
            sum = sum + number % 10;
            number = number / 10;
        }

        return sum;
    }

    private static int charToNumber(char[] digits) {
        int lifeNumber = 0;
        for (char digit : digits) {
            lifeNumber = lifeNumber + Character.getNumericValue(digit);
        }
        return lifeNumber;
    }

    private static int convertCharsAndSum(char[] letters,Context context) {
        int num = 0, let = 0;
        for (char letter : letters) {
            try {
                if(LanguageController.getLanguage(context).equals("de")&& letter=='ü'){
                    let = 8;
                }else  if(LanguageController.getLanguage(context).equals("de")&& letter=='ä'){
                   let = 6;
                }else
                    let = DataSetConstants.getLetterToNumber().get(letter);
            } catch (NullPointerException e) {
                let = 0;
            }

            num = num + let;
        }

        return num;
    }

    private static int convertConCharsAndSum(char[] letters) {
        int num = 0, let = 0;
        for (char letter : letters) {
            try {
                let = DataSetConstants.getConLetterToNumber().get(letter);
            } catch (NullPointerException e) {
                let = 0;
            }

            num = num + let;
        }

        return num;
    }

    private static int convertVowCharsAndSum(char[] letters,Context context) {
        int num = 0;
        for (char letter : letters) {
            if(LanguageController.getLanguage(context).equals("de")&& letter=='ü'){
                num = num + 8;
            }else  if(LanguageController.getLanguage(context).equals("de")&& letter=='ä'){
                num = num + 6;
            }else
                num = num + DataSetConstants.getVowLetterToNumber().get(letter);
        }

        return num;
    }

    private static int calcToSingleDigit(int number) {
        boolean isStop = false;
        int result = 0;
        result = number;
        while (!isStop) {
            if (result < 10) {
                isStop = true;
            } else {
                result = calcNumToDigits(result);
            }
        }
        return result;
    }

    private static int calcToSingleDigitWithMagicNums(int number) {
        boolean isStop = false;
        int result = 0;
        result = number;
        while (!isStop) {
            if (result == 11 || result == 22 || result < 10) {
                isStop = true;
            } else {
                result = calcNumToDigits(result);
            }
        }
        return result;
    }
}
