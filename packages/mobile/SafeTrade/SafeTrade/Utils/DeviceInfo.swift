import Foundation
import UIKit

class DeviceInfo {
    static let shared = DeviceInfo()

    private init() {}

    // MARK: - Device Information

    func getDeviceModel() -> String {
        var systemInfo = utsname()
        uname(&systemInfo)
        let modelCode = withUnsafePointer(to: &systemInfo.machine) {
            $0.withMemoryRebound(to: CChar.self, capacity: 1) {
                ptr in String.init(validatingUTF8: ptr)
            }
        }
        return modelCode ?? "Unknown"
    }

    func getSystemVersion() -> String {
        return UIDevice.current.systemVersion
    }

    func getDeviceName() -> String {
        return UIDevice.current.name
    }

    func getLocalizedDeviceModel() -> String {
        return UIDevice.current.localizedModel
    }

    // MARK: - Location Information (Placeholder)

    func getRegionInfo() -> String {
        // Return user's region/locale information
        let locale = Locale.current
        return locale.localizedString(forRegionCode: locale.regionCode ?? "MX") ?? "México"
    }

    func getTimezone() -> String {
        return TimeZone.current.identifier
    }

    // MARK: - Default Values for Reports

    func getDeviceDefaultInfo() -> String {
        let model = getLocalizedDeviceModel()
        let region = getRegionInfo()
        return "\(model) - \(region)"
    }

    func getCurrentLocationString() -> String {
        // For privacy, return general region rather than specific location
        return getRegionInfo()
    }
}