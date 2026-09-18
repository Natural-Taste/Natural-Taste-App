require 'xcodeproj'

project_path = File.expand_path('../ios/FoodMap.xcodeproj', __dir__)
project = Xcodeproj::Project.open(project_path)
target_name = 'FoodMapShare'

if project.targets.any? { |target| target.name == target_name }
  abort "Target #{target_name} already exists"
end

target = project.new_target(:app_extension, target_name, :ios, '15.1')
target.product_type = 'com.apple.product-type.app-extension'

source_group = project.main_group.new_group(target_name, target_name)
source_file = source_group.new_file('ShareViewController.swift')
target.add_file_references([source_file])

target.build_configurations.each do |config|
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'org.reactjs.native.example.FoodMap.FoodMapShare'
  config.build_settings['INFOPLIST_FILE'] = "#{target_name}/Info.plist"
  config.build_settings['SWIFT_VERSION'] = '5.0'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
  config.build_settings['CODE_SIGN_STYLE'] = 'Automatic'
end

project.save
puts "Created #{target_name} target"
