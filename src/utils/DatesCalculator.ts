export const DatesCalculator = {
    // Days after born used in Java logic
    calcDaysAfterBorn: (day: number, month: number, year: number): number => {
        // Java Calendar.getInstance() and set(Calendar.MONTH, month)
        // Note: In Java, months are 0-indexed (Jan=0, Feb=1). However, from NumbersCalculator.java logic,
        // it seems the input `month` passed to calcDaysAfterBorn is also generally 1-indexed initially but
        // maybe directly passed. The Java NumbersCalculator passes `month` as `parseInt(split[1]) + 1` usually, but
        // for bio-rhythms it passes `month` raw. Wait, looking at Java NumbersCalculator:
        // `int month = Integer.valueOf(date.split("/")[1]) + 1;`
        // Actually for bio-rhythms: `int day = ...` `int month = ...`
        // The Java code DatesCalculator.java says:
        // `testCalendar.set(Calendar.MONTH, month);`
        // This implies if we pass `1` for Feb, it works as intended (since Java is 0-indexed, 1 implies Feb).
        // Let's assume day, month, year inputs are normal (month 1-12) and we adjust for JS Date.
        const birthDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Java does: long msDiff = Calendar.getInstance().getTimeInMillis() - testCalendar.getTimeInMillis();
        // and calculates daysDiff.
        const msDiff = Date.now() - birthDate.getTime();
        return Math.floor(msDiff / (1000 * 60 * 60 * 24));
    },

    // Days between couples
    calcDaysBetweenCouples: (myself: number[], spouse: number[]): number => {
        // [day, month, year] where month is passed identically as above.
        const date1 = new Date(myself[2], myself[1] - 1, myself[0], 0, 0, 0, 0);
        const date2 = new Date(spouse[2], spouse[1] - 1, spouse[0], 0, 0, 0, 0);

        const msDiff = Math.abs(date1.getTime() - date2.getTime());
        return Math.floor(msDiff / (1000 * 60 * 60 * 24));
    }
};
