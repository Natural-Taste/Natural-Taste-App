import os.log
import UIKit

final class ShareViewController: UIViewController {
    private let logger = Logger(subsystem: "org.reactjs.native.example.FoodMap.FoodMapShare", category: "ShareExtension")

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        inspectSharedItems()
    }

    private func inspectSharedItems() {
        guard let items = extensionContext?.inputItems as? [NSExtensionItem] else {
            logger.error("No NSExtensionItem was received")
            finish()
            return
        }

        logger.log("Received NSExtensionItem count: \(items.count)")
        let providers = items.flatMap { $0.attachments ?? [] }
        logger.log("Received NSItemProvider count: \(providers.count)")

        for (providerIndex, provider) in providers.enumerated() {
            let identifiers = provider.registeredTypeIdentifiers
            logger.log("Provider[\(providerIndex)] registeredTypeIdentifiers: \(identifiers, privacy: .public)")

            for identifier in identifiers {
                logger.log("Provider[\(providerIndex)] loading type: \(identifier, privacy: .public)")
                provider.loadItem(forTypeIdentifier: identifier, options: nil) { [weak self] item, error in
                    if let error {
                        self?.logger.error("Provider[\(providerIndex)] type \(identifier, privacy: .public) error: \(error.localizedDescription, privacy: .public)")
                        return
                    }
                    self?.logPayload(item, identifier: identifier, providerIndex: providerIndex)
                }
            }
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.finish()
        }
    }

    private func logPayload(_ item: NSSecureCoding?, identifier: String, providerIndex: Int) {
        guard let item else {
            logger.log("Provider[\(providerIndex)] type \(identifier, privacy: .public) payload: nil")
            return
        }

        if let url = item as? URL {
            logger.log("Provider[\(providerIndex)] URL payload: \(url.absoluteString, privacy: .public)")
        } else if let text = item as? String {
            logger.log("Provider[\(providerIndex)] text payload: \(text, privacy: .public)")
        } else if let image = item as? UIImage {
            logger.log("Provider[\(providerIndex)] image payload: UIImage size=\(image.size.width)x\(image.size.height)")
        } else if let data = item as? Data {
            logger.log("Provider[\(providerIndex)] data payload: \(data.count) bytes")
        } else {
            logger.log("Provider[\(providerIndex)] payload type: \(String(describing: type(of: item)), privacy: .public), value: \(String(describing: item), privacy: .public)")
        }
    }

    private func finish() {
        extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
    }
}
