package numerology.dailymistika.ru;

import android.content.Context;
import android.content.res.Configuration;

import java.util.Locale;

import numerology.dailymistika.ru.metadata.Constants;
import numerology.dailymistika.ru.misc.AppPreferences;

public class LanguageController {

    public static void setRussian(Context context) {
        AppPreferences.saveString(context, Constants.LANGUAGE, "ru");
    }
    public static void setSpanish(Context context) {
        AppPreferences.saveString(context, Constants.LANGUAGE, "es");
    }
    public static void setPortuguese(Context context) {
        AppPreferences.saveString(context, Constants.LANGUAGE, "pt");
    }
    public static void setFrench(Context context) {
        AppPreferences.saveString(context, Constants.LANGUAGE, "fr");
    }

    public static void setItalian(Context context) {
        AppPreferences.saveString(context, Constants.LANGUAGE, "it");
    }
    public static void setGerman(Context context) {
        AppPreferences.saveString(context, Constants.LANGUAGE, "de");
    }
    public static void setEnglish(Context context) {
        AppPreferences.saveString(context, Constants.LANGUAGE, "en");
    }

    public static String getLanguage(Context context) {
        try{
            return AppPreferences.getValue(context, Constants.LANGUAGE);
        }catch(Exception e){
            return "en";
        }

    }

    public static void setScreenLanguage(Context context) {
        String lang = LanguageController.getLanguage(context).toLowerCase();
        Locale locale = new Locale(lang.toLowerCase());
        Locale.setDefault(locale);
        Configuration config = new Configuration();
        config.locale = locale;
        context.getResources().updateConfiguration(config, context.getResources().getDisplayMetrics());
    }

    public static String getToolbarComp(Context context, int index) {
        String[] englishToolbarCompatibility = {"Psychomatrix Comp.", "Biorhythm Comp.", "Life Path Comp."};
        String[] spanishToolbarCompatibility = {"Número de la Pareja", "Compatibilidad con biorritmos", "Comp. Camino de vida"};
        String[] germanToolbarCompatibility = {"Psychomatrix Komp.", "Biorhythmus Kompatibilität", "Lebensweg Kompatibilität"};
        String[] frenchToolbarCompatibility = {"Numéro de couple", "Compatibilité des biorythmes", "Commp. du chemin de vie"};
        String[] portToolbarCompatibility = {"Número do Parceiro", "Compatibilidade de Biorritmo", "Compatibilidade do Caminho de Vida"};
        String[] russianToolbarCompatibility = {"Совместимость Пифагора", Constants.BIORITHM_COMPATIBILITY_RUS, "По числу Жизненного Пути"};
        if (AppPreferences.getValue(context, Constants.LANGUAGE).equals("ru")) {
            return russianToolbarCompatibility[index];
        }else  if (AppPreferences.getValue(context, Constants.LANGUAGE).equals("en")) {
            return englishToolbarCompatibility[index];
        }else  if (AppPreferences.getValue(context, Constants.LANGUAGE).equals("pt")) {
            return portToolbarCompatibility[index];
        }else  if (AppPreferences.getValue(context, Constants.LANGUAGE).equals("fr")) {
            return frenchToolbarCompatibility[index];
        }else  if (AppPreferences.getValue(context, Constants.LANGUAGE).equals("de")) {
            return germanToolbarCompatibility[index];
        }
        return spanishToolbarCompatibility[index];
    }

}
