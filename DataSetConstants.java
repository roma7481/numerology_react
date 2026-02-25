package numerology.dailymistika.ru.calc;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import numerology.dailymistika.ru.metadata.Constants;

public class DataSetConstants {

    static ArrayList<String> DobCategoriesRus = new ArrayList<String>( Arrays.asList(Constants.BIRTHDAY_CODE_RUS,
            Constants.BIRTHDAY_NUMBER_RUS,
            Constants.DAILY_LUCKY_NUMBER_RUS,
            Constants.CHARACTER_NUMBER_RUS,
            Constants.LIFE_PATH_NUMBER_RUS,
            Constants.LUCKY_GEM_RUS,
            Constants.MONEY_NUMBER_RUS,
            Constants.PERSONAL_DAY_RUS,
            Constants.PERSONAL_MONTH_RUS,
            Constants.PERSONAL_YEAR_RUS,
            Constants.ACHIEVEMENT_NUMBER_RUS,
            Constants.CHALLENGE_NUMBER_RUS,
            Constants.SOUL_URGE_NUMBER_RUS));

    static ArrayList<String> DobCategoriesEsp = new ArrayList<String>(
            Arrays.asList(Constants.BIRTHDAY_CODE_ESP,
            Constants.BIRTHDAY_NUMBER_ESP,
            Constants.DAILY_LUCKY_NUMBER_ESP,
            Constants.LIFE_PATH_NUMBER_ESP,
            Constants.PERSONAL_DAY_ESP,
            Constants.PERSONAL_MONTH_ESP,
            Constants.PERSONAL_YEAR_ESP,
            Constants.CHALLENGE_NUMBER_ESP,

            Constants.ACHIEVEMENT_NUMBER_ESP));
    static ArrayList<String> NameCategoriesEsp = new ArrayList<String>( Arrays.asList(
            Constants.MATURITY_NUMBER_ESP,
            Constants.KARMIC_LESSON_ESP,
            Constants.NAME_NUMBER_ESP,
            Constants.DESTINY_NUMBER_ESP,
            Constants.PERSONALITY_NUMBER_ESP,
            Constants.SOUL_URGE_NUMBER_ESP,
            Constants.POTENTIAL_NUMBER_ESP,
            Constants.EXPRESSION_NUMBER_ESP));

    static ArrayList<String> NameCategoriesEng = new ArrayList<String>( Arrays.asList(
            Constants.EXPRESSION_NUMBER_ENG,
//            Constants.MARRIAGE_NUMBER_ENG,
            Constants.MATURITY_NUMBER_ENG,
            Constants.NAME_NUMBER_ENG,
            Constants.DESIRE_NUMBER_ENG,
            Constants.PERSONALITY_NUMBER_ENG,
            Constants.SOUL_URGE_NUMBER_ENG,
            Constants.REALIZATION_NUMBER_ENG));

    static ArrayList<String> NameCategoriesPt = new ArrayList<String>( Arrays.asList(
            Constants.EXPRESSION_NUMBER_PORT,
            Constants.MATURITY_NUMBER_PORT,
            Constants.NAME_NUMBER_PORT,
            Constants.DESIRE_NUMBER_PORT,
            Constants.PERSONALITY_NUMBER_PORT,
            Constants.SOUL_URGE_NUMBER_PORT,
            Constants.REALIZATION_NUMBER_PORT));

    static ArrayList<String> NameCategoriesFr = new ArrayList<String>( Arrays.asList(
            Constants.EXPRESSION_NUMBER_FR,
            Constants.MATURITY_NUMBER_FR,
            Constants.NAME_NUMBER_FR,
            Constants.DESIRE_NUMBER_FR,
            Constants.PERSONALITY_NUMBER_FR,
            Constants.SOUL_URGE_NUMBER_FR,
            Constants.REALIZATION_NUMBER_FR));

    static ArrayList<String> NameCategoriesDe = new ArrayList<String>( Arrays.asList(
            Constants.EXPRESSION_NUMBER_DE,
            Constants.MATURITY_NUMBER_DE,
            Constants.NAME_NUMBER_DE,
            Constants.DESIRE_NUMBER_DE,
            Constants.PERSONALITY_NUMBER_DE,
            Constants.SOUL_URGE_NUMBER_DE,
            Constants.REALIZATION_NUMBER_DE));

    static ArrayList<String> NameCategoriesIt = new ArrayList<String>( Arrays.asList(
            Constants.EXPRESSION_NUMBER_IT,
            Constants.MATURITY_NUMBER_IT,
            Constants.NAME_NUMBER_IT,
            Constants.DESIRE_NUMBER_IT,
            Constants.PERSONALITY_NUMBER_IT,
            Constants.SOUL_URGE_NUMBER_IT,
            Constants.REALIZATION_NUMBER_IT));


    static ArrayList<String> DobCategoriesEng = new ArrayList<String>( Arrays.asList(
            Constants.BIRTHDAY_CODE_ENG,
            Constants.BIRTHDAY_NUMBER_ENG,
            Constants.DAILY_LUCKY_NUMBER_ENG,
            Constants.LIFE_PATH_NUMBER_ENG,
            Constants.LUCKY_GEM_ENG,
            Constants.MONEY_NUMBER_ENG,
            Constants.PERSONAL_DAY_ENG,
            Constants.PERSONAL_MONTH_ENG,
            Constants.PERSONAL_YEAR_ENG,
            Constants.CHALLENGE_NUMBER_ENG));

    static ArrayList<String> DobCategoriesPt = new ArrayList<String>( Arrays.asList(
            Constants.BIRTHDAY_CODE_PORT,
            Constants.BIRTHDAY_NUMBER_PORT,
            Constants.DAILY_LUCKY_NUMBER_PORT,
            Constants.LIFE_PATH_NUMBER_PORT,
            Constants.LUCKY_GEM_PORT,
            Constants.MONEY_NUMBER_PORT,
            Constants.PERSONAL_DAY_PORT,
            Constants.PERSONAL_MONTH_PORT,
            Constants.PERSONAL_YEAR_PORT,
            Constants.CHALLENGE_NUMBER_PORT));

    static ArrayList<String> DobCategoriesFr = new ArrayList<String>( Arrays.asList(
            Constants.BIRTHDAY_CODE_FR,
            Constants.BIRTHDAY_NUMBER_FR,
            Constants.DAILY_LUCKY_NUMBER_FR,
            Constants.LIFE_PATH_NUMBER_FR,
            Constants.LUCKY_GEM_FR,
            Constants.MONEY_NUMBER_FR,
            Constants.PERSONAL_DAY_FR,
            Constants.PERSONAL_MONTH_FR,
            Constants.PERSONAL_YEAR_FR,
            Constants.CHALLENGE_NUMBER_FR));

    static ArrayList<String> DobCategoriesDe = new ArrayList<String>( Arrays.asList(
            Constants.BIRTHDAY_CODE_DE,
            Constants.BIRTHDAY_NUMBER_DE,
            Constants.DAILY_LUCKY_NUMBER_DE,
            Constants.LIFE_PATH_NUMBER_DE,
            Constants.LUCKY_GEM_DE,
            Constants.MONEY_NUMBER_DE,
            Constants.PERSONAL_DAY_DE,
            Constants.PERSONAL_MONTH_DE,
            Constants.PERSONAL_YEAR_DE,
            Constants.CHALLENGE_NUMBER_DE));

    static ArrayList<String> DobCategoriesIt = new ArrayList<String>( Arrays.asList(
            Constants.BIRTHDAY_CODE_IT,
            Constants.BIRTHDAY_NUMBER_IT,
            Constants.DAILY_LUCKY_NUMBER_IT,
            Constants.LIFE_PATH_NUMBER_IT,
            Constants.LUCKY_GEM_IT,
            Constants.MONEY_NUMBER_IT,
            Constants.PERSONAL_DAY_IT,
            Constants.PERSONAL_MONTH_IT,
            Constants.PERSONAL_YEAR_IT,
            Constants.CHALLENGE_NUMBER_IT));


    static ArrayList<String> NameCategoriesRus = new ArrayList<String>( Arrays.asList(Constants.BALANCE_NUMBER_RUS,
            Constants.EXPRESSION_NUMBER_RUS,
            Constants.INTELLIGENCE_NUMBER_RUS,
            Constants.MARRIAGE_NUMBER_RUS,
            Constants.MATURITY_NUMBER_RUS,
            Constants.NAME_NUMBER_RUS,
            Constants.PERSONALITY_NUMBER_RUS,
            Constants.REALIZATION_NUMBER_RUS));


    static Map<Character,Integer> letterToNumber = new HashMap<Character,Integer>(){{
        put('a',1);
        put('à',1);
        put('á',1);
        put('ã',1);
        put('â',1);
        put('ä',1);


        put('ß',2);

        put('j',1);
        put('s',1);
        put('b',2);
        put('k',2);
        put('t',2);
        put('ö',2);
        put('c',3);
        put('ç',3);
        put('l',3);
        put('u',3);
        put('ú',3);
        put('ü',3);
        put('ù',3);
        put('û',3);

        put('d',4);
        put('m',4);
        put('v',4);

        put('e',5);
        put('é',5);
        put('ê',5);
        put('è',5);
        put('ë',5);


        put('n',5);
        put('ñ',5);
        put('w',5);
        put('f',6);
        put('o',6);
        put('ó',6);
        put('ô',6);
        put('õ',6);
        put('œ',6);

        put('x',6);
        put('g',7);
        put('p',7);
        put('y',7);
        put('ÿ',7);
        put('h',8);
        put('q',8);
        put('z',8);

        put('i',9);
        put('î',9);
        put('ï',9);
        put('í',9);

        put('r',9);

        put('а',1);
        put('и',1);
        put('с',1);
        put('ъ',1);
        put('б',2);
        put('й',2);
        put('т',2);
        put('ы',2);
        put('в',3);
        put('к',3);
        put('у',3);
        put('ь',3);
        put('г',4);
        put('л',4);
        put('ф',4);
        put('э',4);
        put('д',5);
        put('м',5);
        put('х',5);
        put('ю',5);
        put('е',6);
        put('н',6);
        put('ц',6);
        put('я',6);
        put('ё',7);
        put('о',7);
        put('ч',7);
        put('ж',8);
        put('п',8);
        put('ш',8);
        put('з',9);
        put('р',9);
        put('щ',9);
        put(' ',0);
    }};

    static Map<Character,Integer> vowLetterToNumber = new HashMap<Character,Integer>(){{
        put('a',1);
        put('à',1);
        put('á',1);
        put('ã',1);
        put('â',1);
        put('ä',1);

        put('j',0);
        put('ß',0);
        put('s',0);
        put('b',0);
        put('k',0);
        put('t',0);
        put('c',0);
        put('ç',0);
        put('l',0);

        put('ö',2);

        put('u',3);
        put('ú',3);
        put('ü',3);
        put('ù',3);
        put('û',3);

        put('d',0);
        put('m',0);
        put('v',0);

        put('e',5);
        put('é',5);
        put('ê',5);
        put('è',5);
        put('ë',5);

        put('n',0);
        put('ñ',0);
        put('w',0);
        put('f',0);

        put('o',6);
        put('ó',6);
        put('ô',6);
        put('õ',6);
        put('œ',6);

        put('x',0);
        put('g',0);
        put('p',0);
        put('y',7);
        put('ÿ',7);
        put('h',0);
        put('q',0);
        put('z',0);
        put('i',9);
        put('î',9);
        put('ï',9);
        put('í',9);
        put('ì',9);
        put('r',0);
        put(' ',0);

        put('а',1);
        put('и',1);
        put('с',0);
        put('ъ',0);
        put('б',0);
        put('й',0);
        put('т',0);
        put('ы',2);
        put('в',0);
        put('к',0);
        put('у',3);
        put('ь',0);
        put('г',0);
        put('л',0);
        put('ф',0);
        put('э',4);
        put('д',0);
        put('м',0);
        put('х',0);
        put('ю',5);
        put('е',6);
        put('н',0);
        put('ц',0);
        put('я',6);
        put('ё',7);
        put('о',7);
        put('ч',0);
        put('ж',0);
        put('п',0);
        put('ш',0);
        put('з',0);
        put('р',0);
        put('щ',0);
    }};
    static Map<Character,Integer> conLetterToNumber = new HashMap<Character,Integer>(){{
        put('a',0);
        put('ö',0);
        put('à',0);
        put('á',0);
        put('ã',0);
        put('â',0);
        put('ä',0);
        put('ú',0);
        put('ü',0);
        put('ù',0);
        put('û',0);
        put('é',0);
        put('ê',0);
        put('è',0);
        put('ë',0);
        put('ó',0);
        put('ô',0);
        put('õ',0);
        put('œ',0);
        put('ÿ',0);
        put('î',0);
        put('ï',0);
        put('í',0);



        put('j',1);
        put('s',1);
        put('b',2);
        put('k',2);
        put('t',2);
        put('ß',2);
        put('c',3);
        put('ç',3);
        put('l',3);
        put('u',0);
        put('d',4);
        put('m',4);
        put('v',4);
        put('e',0);
        put('n',5);
        put('ñ',5);
        put('w',5);
        put('f',6);
        put('o',0);
        put('x',6);
        put('g',7);
        put('p',7);
        put('y',0);
        put('h',8);
        put('q',8);
        put('z',8);
        put('i',0);
        put('r',9);
        put(' ',0);

        put('а',0);
        put('и',0);
        put('с',1);
        put('ъ',1);
        put('б',2);
        put('й',2);
        put('т',2);
        put('ы',0);
        put('в',3);
        put('к',3);
        put('у',0);
        put('ь',3);
        put('г',4);
        put('л',4);
        put('ф',4);
        put('э',0);
        put('д',5);
        put('м',5);
        put('х',5);
        put('ю',0);
        put('е',0);
        put('н',6);
        put('ц',6);
        put('я',0);
        put('ё',0);
        put('о',0);
        put('ч',7);
        put('ж',8);
        put('п',8);
        put('ш',8);
        put('з',9);
        put('р',9);
        put('щ',9);
    }};


    static Map<String,String> columnNameToSubCatRus = new HashMap<String,String>(){{
        put("description","Описание");
        put("carear","Карьера");
        put("love","Любовь");
        put("man","Мужчина");
        put("women","Женщина");
        put("woman","Женщина");
        put("person_characteristic","Ваша Характеристика");
        put("detailedDescription","Детальное Описание");
        put("detaildDescription","Детальное Описание");
    }};

    static Map<String,String> columnNameToSubCatEng = new HashMap<String,String>(){{
        put("description","Description");
        put("negative","Negative Sides");
        put("profession","Profession");
        put("finances","Finances");
        put("relationships","Relationship");
        put("health","Health");
        put("detailedDescription","Detailed Description");
    }};

    static Map<String,String> columnNameToSubCatPort = new HashMap<String,String>(){{
        put("description","Descrição");
        put("negative","Lados Negativos");
        put("profession","Profissão");
        put("finances","Finanças");
        put("relationships","Relação");
        put("health","Saúde");
        put("detailedDescription","Descrição detalhada");
    }};

    static Map<String,String> columnNameToSubCatFr = new HashMap<String,String>(){{
        put("description","Description");
        put("negative","Les aspects négatifs");
        put("profession","Profession");
        put("finances","Finances");
        put("relationships","Relations");
        put("health","Santé");
        put("detailedDescription","Description détaillée");
    }};
    static Map<String,String> columnNameToSubCatDe = new HashMap<String,String>(){{
        put("description","Bezeichnung");
        put("negative","Die negativen Aspekte");
        put("profession","Beruf");
        put("finances","Finanzen");
        put("relationships","Beziehungen");
        put("health","Die Gesundheit");
        put("detailedDescription","Detaillierte Beschreibung");
    }};

    static Map<String,String> columnNameToSubCatIt = new HashMap<String,String>(){{
        put("description","Descrizione");
        put("negative","Lati negativi");
        put("profession","Professione");
        put("finances","Finanze");
        put("relationships","Relazione");
        put("health","Salute");
        put("detailedDescription","Descrizione dettagliata");
    }};

    static Map<String,String> columnNameToSubCatEsp = new HashMap<String,String>(){{
        put("description","Descripción");
        put("negative","Aspectos negativos");
        put("profession","Profesión");
        put("finances","Finanzas");
        put("relationships","Relación");
        put("health","Salud");
        put("detailedDescription","Descripción detallada");
    }};

    public static Map<Character,Integer> getLetterToNumber(){
        return letterToNumber;
    }

    public static Map<Character, Integer> getVowLetterToNumber() {
        return vowLetterToNumber;
    }

    public static Map<Character, Integer> getConLetterToNumber() {
        return conLetterToNumber;
    }

    public static ArrayList<String> getDobCategoriesRus() {
        return DobCategoriesRus;
    }

    public static ArrayList<String> getDobCategoriesEng() {
        return DobCategoriesEng;
    }

    public static ArrayList<String> getDobCategoriesPt() {
        return DobCategoriesPt;
    }
    public static ArrayList<String> getDobCategoriesFr() {
        return DobCategoriesFr;
    }
    public static ArrayList<String> getDobCategoriesDe() {
        return DobCategoriesDe;
    }

    public static ArrayList<String> getDobCategoriesIt() {
        return DobCategoriesIt;
    }
    public static Map<String, String> getColumnNameToSubCatRus() {
        return columnNameToSubCatRus;
    }

    public static Map<String, String> getColumnNameToSubCatEng() {
        return columnNameToSubCatEng;
    }
    public static Map<String, String> getColumnNameToSubCatPort() {
        return columnNameToSubCatPort;
    }
    public static Map<String, String> getColumnNameToSubCatFr() {
        return columnNameToSubCatFr;
    }
    public static Map<String, String> getColumnNameToSubCatDe() {
        return columnNameToSubCatDe;
    }
    public static Map<String, String> getColumnNameToSubCatIt() {
        return columnNameToSubCatIt;
    }
    //columnNameToSubCatFr
    public static Map<String, String> getColumnNameToSubCatEsp() {
        return columnNameToSubCatEsp;
    }
    public static ArrayList<String> getNameCategoriesRus() {
        return NameCategoriesRus;
    }

    public static ArrayList<String> getNameCategoriesEng() {
        return NameCategoriesEng;
    }
    public static ArrayList<String> getNameCategoriesPt() {
        return NameCategoriesPt;
    }
    public static ArrayList<String> getNameCategoriesFr() {
        return NameCategoriesFr;
    }

    public static ArrayList<String> getNameCategoriesDe() {
        return NameCategoriesDe;
    }
    public static ArrayList<String> getNameCategoriesIt() {
        return NameCategoriesIt;
    }
    public static ArrayList<String> getDobCategoriesEsp() {
        return DobCategoriesEsp;
    }

    public static ArrayList<String> getNameCategoriesEsp() {
        return NameCategoriesEsp;
    }
}
