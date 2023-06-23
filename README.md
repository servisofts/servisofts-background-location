

### Install dependecy

```bash
    npm install --save servisofts-background-location
```

### Link to react native

```bash
    npx react-native link
```


### IOS

```bash
   cd ios && pod install
```

add to Info.plist
```xml
    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
	<string>This is needed to get location updates in the background</string>
	
    <key>NSLocationWhenInUseUsageDescription</key>
	<string>This is needed to get location updates when in use</string>
    
    <key>UIBackgroundModes</key>
	<array>
        ...
		<string>fetch</string>
		<string>location</string>
		
	</array>
```

### Android

add permission in AndroidManifest.xml
```xml
	<uses-permission android:name="android.permission.INTERNET" />
	<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
	<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
	<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
	<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
	<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
	<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>
	<uses-permission android:name="android.permission.VIBRATE" />
	<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```
add this lines in AndroidManifest.xml
```xml
<application >
    ...

	<service android:name="com.servisofts.background.location.SSBL_Service" android:enabled="true" android:exported="true" />
		<service android:name="com.servisofts.background.location.SSBL_event" android:enabled="true" android:exported="true"/>
		<receiver android:name="com.servisofts.background.location.SSBL_BootUpReceiver"
			android:enabled="true"
            android:exported="true"
			android:permission="android.permission.RECEIVE_BOOT_COMPLETED">
			<intent-filter>
				<action android:name="android.intent.action.BOOT_COMPLETED" />
				<category android:name="android.intent.category.DEFAULT" />
			</intent-filter>
		</receiver>

</application>
```
   

## Usage

in app initEmitter

```javascript
    
    import { SBLocation } from 'servisofts-background-location';
    
    ...

    const App = (props) => {
        SBLocation.initEmitter((data) => {
            if (data?.type == "locationChange") {
                console.log(data);
                //Send http to server
            }
            return true;
        })

    ...
    
```


Start
```javascript
          SBLocation.start({
            nombre: "Title notification",
            label: "Body notification",
            minTime: 1000, 
            minDistance: 1 
          });
```

Stop
```javascript
        SBLocation.stop();
```
