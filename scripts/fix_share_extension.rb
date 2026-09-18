require 'xcodeproj'

project_path = File.expand_path('../ios/FoodMap.xcodeproj', __dir__)
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |candidate| candidate.name == 'FoodMapShare' }
abort 'FoodMapShare target not found' unless target

target.product_reference.path = 'FoodMapShare.appex'
target.product_reference.name = 'FoodMapShare.appex'

target.build_configurations.each do |config|
  config.build_settings['PRODUCT_NAME'] = 'FoodMapShare'
  config.build_settings['MARKETING_VERSION'] = '1.0'
  config.build_settings['CURRENT_PROJECT_VERSION'] = '1'
end

project.save
puts 'Fixed FoodMapShare product settings'
