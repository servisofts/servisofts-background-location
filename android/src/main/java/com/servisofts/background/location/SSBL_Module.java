package com.servisofts.background.location;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.provider.Settings;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONObject;

public class SSBL_Module extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "SSBackgroundLocation";
    private ReactApplicationContext reactContext;

    public SSBL_Module(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    public boolean checkPermision(){
        if (ActivityCompat.checkSelfPermission(this.reactContext, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ActivityCompat.checkSelfPermission(this.reactContext,
                Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    this.reactContext.getCurrentActivity(),
                            new String[] { Manifest.permission.ACCESS_FINE_LOCATION },
                            110);
            return false;
        }
        return true;
    }
    @ReactMethod
    public void start(String data, Promise cb) {
        try{
            if(checkPermision()==false){
                cb.resolve( "error permisos");
               // return;
            }else{
                Intent serviceIntent = new Intent(this.reactContext, SSBL_Service.class);
                getCurrentActivity().stopService(serviceIntent);
                serviceIntent.putExtra("props",data);
                ContextCompat.startForegroundService(this.reactContext, serviceIntent);
                cb.resolve( "exito");
            }

        }catch (Exception e){
            cb.resolve(e.getLocalizedMessage());
        }
    }

    @ReactMethod
    public void stop( Promise cb) {
        try{
            Intent serviceIntent = new Intent(this.reactContext, SSBL_Service.class);
            getCurrentActivity().stopService(serviceIntent);
            cb.resolve( "exito");
        }catch (Exception e){
            cb.resolve(e.getLocalizedMessage());
        }
    }
}
