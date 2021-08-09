// RCTCalendarModule.m
//#import "RCTCalendarModule.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>

//@implementation RCTCalendarModule

// To export a module named RCTCalendarModule
//RCT_EXPORT_MODULE();

//RCT_EXPORT_METHOD(createCalendarEvent:(NSString *)name location:(NSString *)location)
//{
//  RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
//}
//@end

@interface RCT_EXTERN_MODULE(CalendarManager, NSObject)
 
RCT_EXTERN_METHOD(constantsToExport)
@end
