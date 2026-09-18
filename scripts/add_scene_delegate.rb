require 'xcodeproj'

project_path = File.expand_path('../ios/FoodMap.xcodeproj', __dir__)
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |candidate| candidate.name == 'FoodMap' }
abort 'FoodMap target not found' unless target

group = project.main_group.groups.find { |candidate| candidate.display_name == 'FoodMap' }
abort 'FoodMap group not found' unless group

file_ref = group.files.find { |file| file.display_name == 'SceneDelegate.swift' }
if file_ref
  file_ref.path = 'FoodMap/SceneDelegate.swift'
else
  file_ref = group.new_file('FoodMap/SceneDelegate.swift')
  target.add_file_references([file_ref])
end

project.save
puts 'Added SceneDelegate to FoodMap target'
