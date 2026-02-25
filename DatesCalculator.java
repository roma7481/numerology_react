package numerology.dailymistika.ru.calc;

import android.content.Context;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class DatesCalculator {

    static Map<String,String> monthToLongMonth = new HashMap<String,String>(){{
        put("Янв","Января");
        put("Фев","Февраля");
        put("Мар","Марта");
        put("Апр","Апреля");
        put("Май","Мая");
        put("Июн","Июня");
        put("Июл","Июля");
        put("Авг","Августа");
        put("Сен","Сентября");
        put("Окт","Октября");
        put("Ноя","Ноября");
        put("Дек","Декабря");
        put("Jan","January");
        put("Feb","February");
        put("Mar","March");
        put("Apr","April");
        put("May","May");
        put("Jun","June");
        put("Jul","July");
        put("Aug","August");
        put("Sep","September");
        put("Oct","October");
        put("Nov","November");
        put("Dec","December");
    }};

    static Map<String,String> monthToLongMonthEsp = new HashMap<String,String>(){{
        put("Ene","Enero");
        put("Feb","Febrero");
        put("Mar","Marzo");
        put("Abr","Abril");
        put("May","Mayo");
        put("Jun","Junio");
        put("Jul","Julio");
        put("Ago","Agosto");
        put("Sep","Septiembre");
        put("Oct","Octubre");
        put("Nov","Noviembre");
        put("Dic","Diciembre");
    }};

    static Map<String,String> monthToLongMonthPt = new HashMap<String,String>(){{
        put("jan","janeiro");
        put("fev","fevereiro");
        put("março","março");
        put("abril","abril");
        put("maio","maio");
        put("junho","junho");
        put("julho","julho");
        put("agosto","agosto");
        put("set","setembro");
        put("out","outubro");
        put("nov","novembro");
        put("dez","dezembro");
    }};

    static Map<String,String> monthToLongMonthFr = new HashMap<String,String>(){{
        put("jan","janvier");
        put("fev","février");
        put("mar","mars");
        put("avr","avril");
        put("mai","mai");
        put("jui","juin");
        put("juil","juillet");
        put("aout","aout");
        put("sep","septembre");
        put("oct","octobre");
        put("nov","novembre");
        put("dec","décembre");
    }};
    static Map<String,String> monthToLongMonthDe = new HashMap<String,String>(){{
        put("Jan","Januar");
        put("Feb","Februar");
        put("Mär","März");
        put("Apr","April");
        put("Mai","Mai");
        put("Jun","Juni");
        put("Jul","Juli");
        put("Aug","August");
        put("Sep","September");
        put("Okt","Oktober");
        put("Nov","November");
        put("Dez","Dezember");
    }};

    static Map<String,String> monthToLongMonthIt = new HashMap<String,String>(){{
        put("Gen","Gennaio");
        put("Feb","Febbraio");
        put("Mar","Marzo");
        put("Apr","Aprile");
        put("Mag","Maggio");
        put("Giu","Giugno");
        put("Lug","Luglio");
        put("Ago","Agosto");
        put("Set","Settembre");
        put("Ott","Ottobre");
        put("Nov","Novembre");
        put("Dic","Dicembre");
    }};



    public static int[] decodeDate(String date) {

        int[] dates = new int[3];
        String[] decode = date.split("/");
        dates[0] = Integer.parseInt(decode[0]);
        dates[1] = Integer.parseInt(decode[1]);
        dates[2] = Integer.parseInt(decode[2]);
        return dates;
    }

    public static String getStringDate(String date,String lan){
        String[] monthEng = {"January","February","March","April","May","June","July","August","September","October","November","December"};
        String[] monthRus = {"Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"};
        String[] monthEsp = {"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};
        String[] monthPort = {"janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"};
        String[] monthFr = {"janvier", "février", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "décembre"};
        String[] monthDe = {"Januar","Februar", "März","April","Mai","Juni","Juli","August","September","Oktober", "November", "Dezember" };
        String[] monthIt = {"Gennaio","Febbraio", "Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre", "Novembre", "Dicembre" };
        int[] dates = decodeDate(date);
        if (lan.equals("ru")){
            return monthRus[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else if(lan.equals("en")){
            return monthEng[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else if(lan.equals("pt")){
            return monthPort[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else if(lan.equals("fr")){
            return monthFr[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else if(lan.equals("de")){
            return monthDe[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else if(lan.equals("it")){
            return monthIt[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else{
            return monthEsp[dates[1]] + " "+dates[0] + " ," + dates[2];
        }
    }

    public static String getStringDateShort(String date,String lan){
        String[] monthEng = {"Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."};
        String[] monthRus = {"Янв.","Фев.","Мар.","Апр.","Май","Июн.","Июл.","Авг.","Сен.","Окт.","Ноя.","Дек."};
        String[] monthEsp = {"Enero.", "Feb.", "Marzo.", "Abr.", "Mayo.", "Jun.", "Jul.", "Agosto.", "Sept.", "Oct.", "Nov.", "Dic."};
        String[] monthPort = {"jan.", "fev.", "março.", "abril.", "maio.", "junho.", "julho.", "agosto.", "set.", "out.", "nov.", "dez."};
        String[] monthFr = {"jan.", "fev.", "mar.", "avr.", "mai.", "jui.", "juil.", "aout.", "sep.", "oct.", "nov.", "dec."};
        String[] monthDe = {"Jan.","Feb.", "Mär.","Apr.","Mai","Jun.","Jul.","Aug.","Sep.","Okt.", "Nov.", "Dez." };
        String[] monthIt = {"Gen.","Feb.", "Mär.","Apr.","Mag","Giu.","Lug.","Ago.","Set.","Ott.", "Nov.", "Dic." };

        int[] dates = decodeDate(date);
        if (lan.equals("ru")){
            return monthRus[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else if(lan.equals("en")){
            return monthEng[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else if(lan.equals("pt")){
            return monthPort[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else if(lan.equals("fr")){
            return monthFr[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else if(lan.equals("de")){
            return monthDe[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else if(lan.equals("it")){
            return monthIt[dates[1]] + " "+dates[0] + " ," + dates[2];
        }else{
            return monthEsp[dates[1]] + " "+dates[0] + " ," + dates[2];
        }
    }


    public static String titleDate(String lan){
        String[] monthEng = {"January","February","March","April","May","June","July","August","September","October","November","December"};
        String[] monthRus = {"Января","Февраля","Марта","Апреля","Мая","Июня","Июля","Августа","Сентября","Октября","Ноября","Декабря"};
        String[] monthEsp = {"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};
        String[] monthPort = {"janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"};
        String[] monthFr = {"janvier", "février", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "décembre"};
        String[] monthDe = {"Januar","Februar", "März","April","Mai","Juni","Juli","August","September","Oktober", "November", "Dezember" };
        String[] monthIt = {"Gennaio","Febbraio", "Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre", "Novembre", "Dicembre" };
        Calendar cal = Calendar.getInstance();
        int month = cal.get(Calendar.MONTH);
        if(lan.equals("ru")){
            return cal.get(Calendar.DAY_OF_MONTH) + " " + monthRus[month];
        }else if(lan.equals("en")){
            return monthEng[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("pt")){
            return monthPort[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("fr")){
            return monthFr[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("de")){
            return monthDe[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("it")){
            return monthIt[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else{
            return monthEsp[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }
    }
    public static String shortTitleDate(String lan){
        String[] monthEng = {"Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."};
        String[] monthRus = {"Янв.","Фев.","Мар.","Апр.","Май","Июн.","Июл.","Авг.","Сен.","Окт.","Ноя.","Дек."};
        String[] monthEsp = {"Enero.", "Feb.", "Marzo.", "Abr.", "Mayo.", "Jun.", "Jul.", "Agosto.", "Sept.", "Oct.", "Nov.", "Dic."};
        String[] monthPort = {"jan.", "fev.", "março.", "abril.", "maio.", "junho.", "julho.", "agosto.", "set.", "out.", "nov.", "dez."};
        String[] monthFr = {"jan.", "fev.", "mar.", "avr.", "mai.", "jui.", "juil.", "aout.", "sep.", "oct.", "nov.", "dec."};
        String[] monthDe = {"Jan.","Feb.", "Mär.","Apr.","Mai.","Jun.","Jul.","Aug.","Sep.","Okt.", "Nov.", "Dez." };
        String[] monthIt = {"Gen.","Feb.", "Mär.","Apr.","Mag","Giu.","Lug.","Ago.","Set.","Ott.", "Nov.", "Dic." };
        Calendar cal = Calendar.getInstance();
        int month = cal.get(Calendar.MONTH);
        if(lan.equals("ru")){
            return cal.get(Calendar.DAY_OF_MONTH) + " " + monthRus[month];
        }else if(lan.equals("en")){
            return monthEng[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("pt")){
            return monthPort[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("fr")){
            return monthFr[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("de")){
            return monthDe[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("it")){
            return monthIt[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else{
            return monthEsp[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }
    }

    public static String shortTitleDate(String lan,int i){
        String[] monthEng = {"Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."};
        String[] monthRus = {"Янв.","Фев.","Мар.","Апр.","Май","Июн.","Июл.","Авг.","Сен.","Окт.","Ноя.","Дек."};
        String[] monthEsp = {"Enero.", "Feb.", "Marzo.", "Abr.", "Mayo.", "Jun.", "Jul.", "Agosto.", "Sept.", "Oct.", "Nov.", "Dic."};
        String[] monthPort = {"jan.", "fev.", "março.", "abril.", "maio.", "junho.", "julho.", "agosto.", "set.", "out.", "nov.", "dez."};
        String[] monthFr = {"jan.", "fev.", "mar.", "avr.", "mai.", "jui.", "juil.", "aout.", "sep.", "oct.", "nov.", "dec."};
        String[] monthDe = {"Jan.","Feb.", "Mär.","Apr.","Mai.","Jun.","Jul.","Aug.","Sep.","Okt.", "Nov.", "Dez." };
        String[] monthIt = {"Gen.","Feb.", "Mär.","Apr.","Mag","Giu.","Lug.","Ago.","Set.","Ott.", "Nov.", "Dic." };
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE,i);
        int month = cal.get(Calendar.MONTH);
        if(lan.equals("ru")){
            return cal.get(Calendar.DAY_OF_MONTH) + " " + monthRus[month];
        }else if(lan.equals("en")){
            return monthEng[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("pt")){
            return monthPort[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("fr")){
            return monthFr[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("de")){
            return monthDe[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else if(lan.equals("it")){
            return monthIt[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }else{
            return monthEsp[month] + " " + cal.get(Calendar.DAY_OF_MONTH);
        }
    }
    public static String titleMonth(String lan){
        String[] monthEng = {"January","February","March","April","May","June","July","August","September","October","November","December"};
        String[] monthRus = {"Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"};
        String[] monthEsp = {"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};
        String[] monthPort = {"janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"};
        String[] monthFr = {"janvier", "février", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "décembre"};
        String[] monthDe = {"Januar","Februar", "März","April","Mai","Juni","Juli","August","September","Oktober", "November", "Dezember" };
        String[] monthIt = {"Gennaio","Febbraio", "Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre", "Novembre", "Dicembre" };
        Calendar cal = Calendar.getInstance();
        int month = cal.get(Calendar.MONTH);
        if(lan.equals("ru")){
            return monthRus[month];
        }else if(lan.equals("en")){
            return monthEng[month];
        }else if(lan.equals("pt")){
            return monthPort[month];
        }else if(lan.equals("fr")){
            return monthFr[month];
        }else if(lan.equals("de")){
            return monthDe[month];
        }else if(lan.equals("it")){
            return monthIt[month];
        }else{
            return monthEsp[month];
        }
    }

    public static String getMonth(String lan,int addValue){
        String[] monthEng = {"January","February","March","April","May","June","July","August","September","October","November","December"};
        String[] monthRus = {"Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"};
        String[] monthEsp = {"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};
        String[] monthPort = {"janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"};
        String[] monthFr = {"janvier", "février", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "décembre"};
        String[] monthDe = {"Januar","Februar", "März","April","Mai","Juni","Juli","August","September","Oktober", "November", "Dezember" };
        String[] monthIt = {"Gennaio","Febbraio", "Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre", "Novembre", "Dicembre" };
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.MONTH,addValue);
        int month = cal.get(Calendar.MONTH);
        if(lan.equals("ru")){
            return monthRus[month];
        }else if(lan.equals("en")){
            return monthEng[month];
        }else if(lan.equals("pt")){
            return monthPort[month];
        }else if(lan.equals("fr")){
            return monthFr[month];
        }else if(lan.equals("de")){
            return monthDe[month];
        }else if(lan.equals("it")){
            return monthIt[month];
        }else{
            return monthEsp[month];
        }
    }


    public static String getYear(int addValue){
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.YEAR,addValue);
        return "" +  cal.get(Calendar.YEAR);
    }

    public static long calcDaysAfterBorn(int day,int month,int year){

        Calendar testCalendar = Calendar.getInstance();
        testCalendar.set(Calendar.MONTH, month);
        testCalendar.set(Calendar.DAY_OF_MONTH, day);
        testCalendar.set(Calendar.YEAR, year);
        testCalendar.set(Calendar.HOUR, 0);
        testCalendar.set(Calendar.MINUTE, 0);

        Calendar testCalendar2 = Calendar.getInstance();
        testCalendar2.set(Calendar.MONTH,  Calendar.getInstance().get(Calendar.MONTH));
        testCalendar2.set(Calendar.DAY_OF_MONTH, Calendar.getInstance().get(Calendar.DAY_OF_MONTH));
        testCalendar2.set(Calendar.YEAR, Calendar.getInstance().get(Calendar.YEAR));
        testCalendar2.set(Calendar.HOUR,0);
        testCalendar2.set(Calendar.MINUTE,0);
//        Date d1 = null;
//        Date d2 = null;
//        d1 = testCalendar.getTime();
//        d2 = Calendar.getInstance().getTime();
//        long diff = d2.getTime() - d1.getTime();
//        long diffDays = diff / (24 * 60 * 60 * 1000);
        long msDiff = Calendar.getInstance().getTimeInMillis() - testCalendar.getTimeInMillis();
        long daysDiff = TimeUnit.MILLISECONDS.toDays(msDiff);
        return daysDiff;
    }

    public static long calcDaysBetweenCouples(int [] myself, int[] spouse){

        Calendar testCalendar = Calendar.getInstance();
        testCalendar.set(Calendar.MONTH, myself[1]);
        testCalendar.set(Calendar.DAY_OF_MONTH, myself[0]);
        testCalendar.set(Calendar.YEAR, myself[2]);
        Calendar spouseCalendar = Calendar.getInstance();
        spouseCalendar.set(Calendar.MONTH, spouse[1]);
        spouseCalendar.set(Calendar.DAY_OF_MONTH, spouse[0]);
        spouseCalendar.set(Calendar.YEAR, spouse[2]);
        long msDiff = testCalendar.getTimeInMillis() - spouseCalendar.getTimeInMillis();
        long daysDiff = TimeUnit.MILLISECONDS.toDays(msDiff);
        return daysDiff;
    }

    public static long calcDaysFromBornTillStartOfMonth(int days,int month,int year){
        Calendar testCalendar = Calendar.getInstance();
        testCalendar.set(Calendar.MONTH, month);
        testCalendar.set(Calendar.DAY_OF_MONTH, days);
        testCalendar.set(Calendar.YEAR, year);
        long msDiff = Calendar.getInstance().getTimeInMillis() - testCalendar.getTimeInMillis();
        msDiff = msDiff - ((Calendar.getInstance().get(Calendar.DAY_OF_MONTH) - 1) * 86400000);
        //86400000
        long daysDiff = TimeUnit.MILLISECONDS.toDays(msDiff);
        return daysDiff;
    }

    public static ArrayList<String> convertPointsToDatesEng(int daysToShow, int daysBack){
        String[] months = {"Jan.","Feb.","Mar.","Apr.","May. ","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."};
        ArrayList<String> dates = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE,daysBack);
        for(int i = 1;i<daysToShow;i++){
            cal.add(Calendar.DATE,1);
            dates.add(months[cal.get(Calendar.MONTH)] + cal.get(Calendar.DAY_OF_MONTH));
        }
        return dates;
    }
    public static ArrayList<String> convertPointsToDatesEsp(int daysToShow, int daysBack){
        String[] months = {"Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."};
        ArrayList<String> dates = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE,daysBack);
        for(int i = 1;i<daysToShow;i++){
            cal.add(Calendar.DATE,1);
            dates.add(months[cal.get(Calendar.MONTH)] + cal.get(Calendar.DAY_OF_MONTH));
        }
        return dates;
    }

    public static ArrayList<String> convertPointsToDatesPt(int daysToShow, int daysBack){
        String[] months = {"jan.", "fev.", "março.", "abril.", "maio.", "junho.", "julho.", "agosto.", "set.", "out.", "nov.", "dez."};
        ArrayList<String> dates = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE,daysBack);
        for(int i = 1;i<daysToShow;i++){
            cal.add(Calendar.DATE,1);
            dates.add(months[cal.get(Calendar.MONTH)] + cal.get(Calendar.DAY_OF_MONTH));
        }
        return dates;
    }

    public static ArrayList<String> convertPointsToDatesFr(int daysToShow, int daysBack){
        String[] months = {"jan.", "fev.", "mar.", "avr.", "mai.", "jui.", "juil.", "aout.", "sep.", "oct.", "nov.", "dec."};
        ArrayList<String> dates = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE,daysBack);
        for(int i = 1;i<daysToShow;i++){
            cal.add(Calendar.DATE,1);
            dates.add(months[cal.get(Calendar.MONTH)] + cal.get(Calendar.DAY_OF_MONTH));
        }
        return dates;
    }
    public static ArrayList<String> convertPointsToDatesDe(int daysToShow, int daysBack){
        String[] months ={"Jan.","Feb.", "Mär.","Apr.","Mai.","Jun.","Jul.","Aug.","Sep.","Okt.", "Nov.", "Dez." };
        ArrayList<String> dates = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE,daysBack);
        for(int i = 1;i<daysToShow;i++){
            cal.add(Calendar.DATE,1);
            dates.add(months[cal.get(Calendar.MONTH)] + cal.get(Calendar.DAY_OF_MONTH));
        }
        return dates;
    }
    public static ArrayList<String> convertPointsToDatesIt(int daysToShow, int daysBack){
        String[] months = {"Gen.","Feb.", "Mär.","Apr.","Mag","Giu.","Lug.","Ago.","Set.","Ott.", "Nov.", "Dic." };
        ArrayList<String> dates = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE,daysBack);
        for(int i = 1;i<daysToShow;i++){
            cal.add(Calendar.DATE,1);
            dates.add(months[cal.get(Calendar.MONTH)] + cal.get(Calendar.DAY_OF_MONTH));
        }
        return dates;
    }
    public static ArrayList<String> convertPointsToDatesRus(int daysToShow, int daysBack){
        String[] months = {"Янв.","Фев.","Мар.","Апр.","Май.","Июн.","Июл.","Авг.","Сен.","Окт.","Ноя.","Дек."};
        ArrayList<String> dates = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DATE,daysBack);
        for(int i = 1;i<daysToShow;i++){
            cal.add(Calendar.DATE,1);
            dates.add(months[cal.get(Calendar.MONTH)] + cal.get(Calendar.DAY_OF_MONTH));
        }
        return dates;
    }

    public static String convertShortMonth(String date,String language){
        if(language.equals("ru")){
            return date.split("\\.")[1] + " " + monthToLongMonth.get(date.split("\\.")[0]);
        }else  if(language.equals("en")){
            return  monthToLongMonth.get(date.split("\\.")[0]) + " " + date.split("\\.")[1];
        }else  if(language.equals("pt")){
            return  monthToLongMonthPt.get(date.split("\\.")[0]) + " " + date.split("\\.")[1];
        }else  if(language.equals("fr")){
            return  monthToLongMonthFr.get(date.split("\\.")[0]) + " " + date.split("\\.")[1];
        }else  if(language.equals("de")){
            return  monthToLongMonthDe.get(date.split("\\.")[0]) + " " + date.split("\\.")[1];
        }else  if(language.equals("it")){
            return  monthToLongMonthIt.get(date.split("\\.")[0]) + " " + date.split("\\.")[1];
        }else{
            return monthToLongMonthEsp.get(date.split("\\.")[0]) + " " + date.split("\\.")[1];
        }

    }


}
