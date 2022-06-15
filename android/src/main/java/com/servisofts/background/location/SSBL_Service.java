package com.servisofts.background.location;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;

import com.facebook.react.HeadlessJsTaskService;

import org.json.JSONException;
import org.json.JSONObject;

public class SSBL_Service extends Service implements LocationListener {
    public static final String CHANNEL_ID = "SSBackgroundService.servisofts";
    public static final int SERVICE_NOTIFICATION_ID = 1;
    private LocationManager locationManager;
    private JSONObject props;

    private int minTime = 5000;
    private int minDistance = 0;
    @Override
    public void onCreate() {
        super.onCreate();
        setLocationProps();

    }

    public void setLocationProps(){
            if (ActivityCompat.checkSelfPermission(SSBL_Service.this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                    && ActivityCompat.checkSelfPermission(SSBL_Service.this,
                    Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {return;}
            if(locationManager==null) {
                locationManager = (LocationManager) getApplicationContext().getSystemService(Context.LOCATION_SERVICE);
            }
            locationManager.removeUpdates(this);
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, this.minTime, this.minDistance, this);
            locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, this.minTime, this.minDistance, this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        try {
            this.props = new JSONObject(intent.getStringExtra("props"));
            String nombre = this.props.getString("nombre");
            String label = this.props.getString("label");

            if(this.props.has("minTime")){
                this.minTime = this.props.getInt("minTime");
            }
            if(this.props.has("minDistance")){
                this.minDistance = this.props.getInt("minDistance");
            }
            setLocationProps();

            createNotificationChannel();
            Intent notificationIntent = new Intent(this,getApplication().getClass());
            PendingIntent contentIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_CANCEL_CURRENT);
            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(nombre)
                    .setContentText(label)
//                    .setSmallIcon()
                    .setContentIntent(contentIntent)
                    .setOngoing(true)
                    .build();
            startForeground(SERVICE_NOTIFICATION_ID, notification);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onLocationChanged(Location location) {
        JSONObject data = new JSONObject();
        try {
            data.put("latitude",location.getLatitude());
            data.put("longitude",location.getLongitude());
            data.put("altitude",location.getAltitude());
            data.put("accuracy",location.getAccuracy());
            data.put("speed",location.getSpeed());
            data.put("time",location.getTime());
            Log.i("LocationChange",data.toString());
            Context context = getApplicationContext();
            Intent myIntent = new Intent(context, SSBL_event.class);
            myIntent.putExtra("data",data.toString());
            context.startService(myIntent);
            HeadlessJsTaskService.acquireWakeLockNow(context);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {

    }

    @Override
    public void onProviderEnabled(String provider) {

    }

    @Override
    public void onProviderDisabled(String provider) {
        Intent i = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(i);

    }
    @Override
    public void onDestroy() {
        super.onDestroy();
        if(locationManager!=null){
            locationManager.removeUpdates(this);
        }
        stopForeground(true);

    }
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Foreground Service Channel",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }

}
