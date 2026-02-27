package numerology.dailymistika.ru.dialogs;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import androidx.core.content.ContextCompat;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import numerology.dailymistika.ru.R;
import numerology.dailymistika.ru.metadata.Constants;
import numerology.dailymistika.ru.misc.AppPreferences;

public class RateDialogController {

    public static void showRateDialog(Context context) {
        int clickNumber = AppPreferences.getInt(context, Constants.SHOW_RATE_DIALOG);
        if (clickNumber > 8 && !AppPreferences.getBoolean(context,Constants.RATE_STATE)) {
            AppPreferences.saveInt(context, Constants.SHOW_RATE_DIALOG, 0);
            showLikeAppDialog(context);
        }else {
            AppPreferences.saveInt(context, Constants.SHOW_RATE_DIALOG, clickNumber + 1);
        }
    }

    private static void showLikeAppDialog(Context context){
        new MaterialAlertDialogBuilder(context, R.style.RateDialogTheme)
                .setMessage(R.string.like_app)
                .setTitle(R.string.rta_dialog_title)
                .setPositiveButton(R.string.yes, (dialogInterface, i) -> {
                    showRate(context);
                })
                .setNegativeButton(R.string.rta_dialog_no, (dialogInterface, i) -> AppPreferences.saveBoolean(context, Constants.RATE_STATE,true))
                .setBackground(ContextCompat.getDrawable(context, R.drawable.dilog_shape))
                .setIcon(R.drawable.ic_rate_us)
                .show();
    }
    private static void showRate(Context context) {
        new MaterialAlertDialogBuilder(context, R.style.RateDialogTheme)
                .setMessage(R.string.rta_dialog_message)
                .setTitle(R.string.rta_dialog_title)
                .setPositiveButton(R.string.rta_dialog_ok, (dialogInterface, i) -> {
                    AppPreferences.saveBoolean(context, Constants.RATE_STATE,true);
                    String packagename = context.getPackageName();
                    Uri uri = Uri.parse("market://details?id="+packagename);
                    Intent goToMarket = new Intent(Intent.ACTION_VIEW, uri);
                    goToMarket.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY |
                            Intent.FLAG_ACTIVITY_NEW_DOCUMENT |
                            Intent.FLAG_ACTIVITY_MULTIPLE_TASK);
                    goToMarket.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    try {
                        context.startActivity(goToMarket);
                    } catch (ActivityNotFoundException e) {
                        context.startActivity(new Intent(Intent.ACTION_VIEW,
                                Uri.parse("http://play.google.com/store/apps/details?id="+packagename)));
                    }
                })
                .setNegativeButton(R.string.rta_dialog_no, (dialogInterface, i) -> AppPreferences.saveBoolean(context, Constants.RATE_STATE,true))
                .setNeutralButton(R.string.rta_dialog_cancel, (dialogInterface, i) -> AppPreferences.saveBoolean(context, Constants.RATE_STATE,false))
                .setBackground(ContextCompat.getDrawable(context, R.drawable.dilog_shape))
                .setIcon(R.drawable.ic_rate_us)
                .show();
    }
}

