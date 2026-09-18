require 'xcodeproj'

project_path = File.expand_path('../ios/FoodMap.xcodeproj', __dir__)
project = Xcodeproj::Project.open(project_path)
app_target = project.targets.find { |target| target.name == 'FoodMap' }
share_target = project.targets.find { |target| target.name == 'FoodMapShare' }
abort 'FoodMap target not found' unless app_target
abort 'FoodMapShare target not found' unless share_target

phase = app_target.copy_files_build_phases.find { |candidate| candidate.name == 'Embed App Extensions' }
phase ||= app_target.new_copy_files_build_phase('Embed App Extensions')
phase.symbol_dst_subfolder_spec = :plug_ins

unless phase.files.any? { |build_file| build_file.file_ref == share_target.product_reference }
  phase.add_file_reference(share_target.product_reference, true)
end

project.save
puts 'Embedded FoodMapShare in FoodMap'
