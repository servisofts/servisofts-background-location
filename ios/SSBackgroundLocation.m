#import "SSBackgroundLocation.h"
#import <UIKit/UIKit.h>
#import <MapKit/MapKit.h>
#import <CoreLocation/CoreLocation.h>

@implementation SSBackgroundLocation
{
  CLLocationManager * locationManager;
   NSDictionary * lastLocationEvent;
}
- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}
 

//export the name of the native module as 'Device' since no explicit name is mentioned
RCT_EXPORT_MODULE(SSBackgroundLocation);

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"onLocationChange"];
}

- (NSDictionary *)constantsToExport
{
  return @{ @"listOfPermissions": @[@"significantLocationChange"] };
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;  // only do this if your module exports constants or calls UIKit
}

//all methods currently async
RCT_EXPORT_METHOD(initialize:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  //RCTLogInfo(@"Pretending to do something natively: initialize");

  resolve(@(true));
}


RCT_EXPORT_METHOD(hasPermissions:(NSString *)permissionType
                 hasPermissionsWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  //RCTLogInfo(@"Pretending to do something natively: hasPermissions %@", permissionType);
  
  BOOL locationAllowed = [CLLocationManager locationServicesEnabled];
  
  resolve(@(locationAllowed));
}

RCT_EXPORT_METHOD(stop:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    [locationManager stopUpdatingLocation];
    [locationManager stopMonitoringSignificantLocationChanges];
    resolve(@"{\"estado\":\"exito\"}");
}

RCT_EXPORT_METHOD(start:(NSString *)data
                 requestPermissionsWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  //NSArray *arbitraryReturnVal = @[@"exito"];
  //RCTLogInfo(@"Pretending to do something natively: requestPermissions %@", permissionType);
    
    NSData *json = [data dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *jsonOutput = [NSJSONSerialization JSONObjectWithData:json options:0 error:nil];
    
    double distance = [[jsonOutput objectForKey:@"minDistance"] doubleValue];
    
    double time = [[jsonOutput objectForKey:@"minTime"] doubleValue];
    
//    double *time = (double) jsonOutput[@"minTime"];
    NSString *name = jsonOutput[@"nombre"];
    NSString *label = jsonOutput[@"label"];

  // location
  if (!locationManager) {
    //RCTLogInfo(@"init locationManager...");
    locationManager = [[CLLocationManager alloc] init];
  }
    
  locationManager.delegate = self;
  locationManager.allowsBackgroundLocationUpdates = true;
  locationManager.pausesLocationUpdatesAutomatically = false;
       
  if ([locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
    [locationManager requestAlwaysAuthorization];
  } else if ([locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)]) {
    [locationManager requestWhenInUseAuthorization];
  }
    
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    switch (status) {
        case kCLAuthorizationStatusNotDetermined:
          //todo
            break;
        case kCLAuthorizationStatusAuthorizedAlways:
                //todo
            break;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
                resolve(@"{\"estado\":\"error\",\"error\":\"permision_background\"}");
                return;
        case kCLAuthorizationStatusRestricted:
                resolve(@"{\"estado\":\"error\",\"error\":\"permision\"}");
                return;
        case kCLAuthorizationStatusDenied:
                resolve(@"{\"estado\":\"error\",\"error\":\"permision\"}");
                return;
        default:
            break;
    }
  
  locationManager.desiredAccuracy = kCLLocationAccuracyBest;
  locationManager.distanceFilter = distance;
  //[locationManager allowDeferredLocationUpdatesUntilTraveled:1.0f timeout:20.0f];
  [locationManager startUpdatingLocation];
  [locationManager startMonitoringSignificantLocationChanges];
 
  resolve(@"{\"estado\":\"exito\"}");
   
}


- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations {
    CLLocation* location = [locations lastObject];
    
    lastLocationEvent = @{
                                  @"latitude": @(location.coordinate.latitude),
                                  @"longitude": @(location.coordinate.longitude),
                                  @"altitude": @(location.altitude),
                                  @"accuracy": @(location.horizontalAccuracy),
                                  @"heading": @(location.course),
                                  @"speed": @(location.speed),
                                  @"time": @([location.timestamp timeIntervalSince1970] * 1000) // in ms
                        };
  
     
                          [self sendEventWithName:@"onLocationChange" body:@{@"data": lastLocationEvent}];
  
  
    //RCTLogInfo(@"significantLocationChange : %@", lastLocationEvent);
}



@end
