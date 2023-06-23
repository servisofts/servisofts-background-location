package com.servisofts.background.location;

import android.Manifest;
import android.app.ActivityManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
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
    public String response(String estado, String error){
        String obj = "{";
        obj+="\"estado\":\""+estado+"\"";
        if(!error.isEmpty()){
            obj+=",\"error\":\""+error+"\"";
        }
        obj+="}";
        return obj;
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

    public boolean checkPermisionBackground(){
        if (ActivityCompat.checkSelfPermission(this.reactContext, Manifest.permission.ACCESS_BACKGROUND_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return false;
        }
        return true;
    }


    @ReactMethod
    public void isActive(Promise cb){
        ActivityManager manager = (ActivityManager) reactContext.getSystemService(reactContext.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (SSBL_Service.class.getName().equals(service.service.getClassName())) {
                cb.resolve( response("exito",""));
                return;
            }
        }
        cb.resolve( response("error",""));
        return;

    }
    @ReactMethod
    public void start(String data, Promise cb) {
        try{
            if(checkPermision()==false){
                cb.resolve( response("error","permision"));
               // return;
            }else{
                if(!checkPermisionBackground()){
                    // cb.resolve( response("error","permision_background"));
                    // return;
                }
                LocationManager lm = (LocationManager)this.reactContext.getSystemService(this.reactContext.LOCATION_SERVICE);
                boolean gps_enabled = false;
                boolean network_enabled = false;

                try {
                    gps_enabled = lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
                } catch(Exception ex) {}

                try {
                    network_enabled = lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
                } catch(Exception ex) {}

                if(!gps_enabled || !network_enabled) {
                    cb.resolve( response("error","gps"));
                    return;
                }


                Intent serviceIntent = new Intent(this.reactContext, SSBL_Service.class);
                getCurrentActivity().stopService(serviceIntent);
                serviceIntent.putExtra("props",data);
                ContextCompat.startForegroundService(this.reactContext, serviceIntent);
                cb.resolve( response("exito",""));
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
            cb.resolve( response("exito",""));
        }catch (Exception e){
            cb.resolve(e.getLocalizedMessage());
        }
    }
}
