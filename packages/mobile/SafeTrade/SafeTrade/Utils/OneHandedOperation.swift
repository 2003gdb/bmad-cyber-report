import SwiftUI
import UIKit

// MARK: - One-Handed Operation Utilities

struct OneHandedOperation {

    // MARK: - Thumb Zones

    /// Defines the thumb-friendly zone for different device sizes
    static func thumbZoneHeight(for screenHeight: CGFloat) -> CGFloat {
        // Bottom 40% of screen is generally reachable with thumb
        return screenHeight * 0.4
    }

    /// Check if a point is in the thumb-friendly zone
    static func isInThumbZone(point: CGPoint, screenSize: CGSize) -> Bool {
        let thumbZoneHeight = thumbZoneHeight(for: screenSize.height)
        let thumbZoneStart = screenSize.height - thumbZoneHeight

        // Also consider horizontal reachability
        let horizontalReachable = point.x <= screenSize.width * 0.85 // Right thumb can reach ~85% of width

        return point.y >= thumbZoneStart && horizontalReachable
    }

    // MARK: - Layout Helpers

    /// Recommended padding for thumb-friendly buttons
    static let thumbFriendlyPadding: CGFloat = 44

    /// Minimum button size for thumb-friendly interaction
    static let minimumTouchTarget: CGFloat = 44

    /// Spacing between thumb-friendly elements
    static let thumbFriendlySpacing: CGFloat = 16

    // MARK: - Device Detection

    static var isSmallDevice: Bool {
        return UIScreen.main.bounds.height <= 667 // iPhone SE, 6, 7, 8
    }

    static var isLargeDevice: Bool {
        return UIScreen.main.bounds.height >= 812 // iPhone X and later
    }

    // MARK: - Action Button Positioning

    /// Calculates optimal position for primary action button
    static func primaryActionButtonFrame(in geometry: GeometryProxy) -> CGRect {
        let screenSize = geometry.size
        let buttonHeight: CGFloat = 50
        let bottomPadding: CGFloat = geometry.safeAreaInsets.bottom + 20

        return CGRect(
            x: 20,
            y: screenSize.height - buttonHeight - bottomPadding,
            width: screenSize.width - 40,
            height: buttonHeight
        )
    }

    /// Calculates optimal position for secondary action button
    static func secondaryActionButtonFrame(in geometry: GeometryProxy, below primaryButton: CGRect) -> CGRect {
        let buttonHeight: CGFloat = 44
        let spacing: CGFloat = 12

        return CGRect(
            x: 20,
            y: primaryButton.minY - buttonHeight - spacing,
            width: geometry.size.width - 40,
            height: buttonHeight
        )
    }
}

// MARK: - SwiftUI Modifiers

extension View {
    /// Makes a view thumb-friendly by ensuring minimum touch target size
    func thumbFriendly() -> some View {
        self.frame(minWidth: OneHandedOperation.minimumTouchTarget,
                   minHeight: OneHandedOperation.minimumTouchTarget)
    }

    /// Positions view in thumb-friendly zone
    func inThumbZone() -> some View {
        self.padding(.bottom, OneHandedOperation.thumbFriendlyPadding)
    }

    /// Applies one-handed operation optimizations
    func oneHandedOptimized() -> some View {
        self
            .thumbFriendly()
            .inThumbZone()
    }
}

// MARK: - Thumb-Friendly Button Style

struct ThumbFriendlyButtonStyle: ButtonStyle {
    let isPrimary: Bool
    let isEnabled: Bool

    init(isPrimary: Bool = false, isEnabled: Bool = true) {
        self.isPrimary = isPrimary
        self.isEnabled = isEnabled
    }

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .fontWeight(isPrimary ? .semibold : .medium)
            .foregroundColor(foregroundColor(isPressed: configuration.isPressed))
            .frame(maxWidth: .infinity)
            .frame(minHeight: OneHandedOperation.minimumTouchTarget)
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(backgroundColor(isPressed: configuration.isPressed))
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }

    private func foregroundColor(isPressed: Bool) -> Color {
        if !isEnabled {
            return .gray
        }

        if isPrimary {
            return .white
        } else {
            return isPressed ? .blue : .primary
        }
    }

    private func backgroundColor(isPressed: Bool) -> Color {
        if !isEnabled {
            return Color(.systemGray4)
        }

        if isPrimary {
            return isPressed ? .blue.opacity(0.8) : .blue
        } else {
            return isPressed ? Color(.systemGray4) : Color(.systemGray6)
        }
    }
}

// MARK: - Swipe Gesture Helper

struct SwipeGestureHelper {

    static func createHorizontalSwipeGesture(
        leftAction: @escaping () -> Void,
        rightAction: @escaping () -> Void,
        threshold: CGFloat = 50
    ) -> some Gesture {
        DragGesture()
            .onEnded { value in
                let horizontalMovement = value.translation.width
                let verticalMovement = abs(value.translation.height)

                // Ensure horizontal swipe is dominant
                if abs(horizontalMovement) > threshold && abs(horizontalMovement) > verticalMovement {
                    if horizontalMovement > 0 {
                        rightAction() // Swipe right
                    } else {
                        leftAction() // Swipe left
                    }
                }
            }
    }

    static func createVerticalSwipeGesture(
        upAction: @escaping () -> Void,
        downAction: @escaping () -> Void,
        threshold: CGFloat = 50
    ) -> some Gesture {
        DragGesture()
            .onEnded { value in
                let horizontalMovement = abs(value.translation.width)
                let verticalMovement = value.translation.height

                // Ensure vertical swipe is dominant
                if abs(verticalMovement) > threshold && abs(verticalMovement) > horizontalMovement {
                    if verticalMovement < 0 {
                        upAction() // Swipe up
                    } else {
                        downAction() // Swipe down
                    }
                }
            }
    }
}