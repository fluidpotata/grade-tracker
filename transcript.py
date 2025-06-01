import re

def parse_transcript_to_courses(transcript):
    courses_data = []
    # Split the entire transcript by multiple spaces or tabs
    parts = [part.strip() for part in re.split(r'\s{2,}|\t+', transcript.strip()) if part.strip()]
    
    # Debug: Print total parts and first 20 parts
    # print(f"Total parts: {len(parts)}")
    # print(f"First 20 parts: {parts[:20]}")
    
    i = 0
    while i < len(parts):
        # Check if the current part is a course prefix
        if parts[i].startswith(('CSE', 'ENG', 'MAT', 'PHY', 'STA', 'BNG', 'EMB', 'HUM', 'CHE', 'ECO', 'SOC', 'ANT', 'BIO')):
            # Debug: Print the potential course being processed
            print(f"Processing course at index {i}: {parts[i:i+6]}")
            # Ensure there are enough parts for at least a course entry
            if i + 4 < len(parts):
                try:
                    course_no = parts[i]
                    # Combine multi-word titles
                    course_title = parts[i + 1]
                    title_index = i + 2
                    # Check if the next part is not a number (credits), indicating a multi-word title
                    while title_index < len(parts) and not re.match(r'^\d+\.\d+$', parts[title_index]):
                        course_title += ' ' + parts[title_index]
                        title_index += 1
                    # Adjust index for credits, grade, and grade points
                    if title_index + 2 < len(parts):
                        credits_earned = float(parts[title_index])  # Verify credits
                        grade = parts[title_index + 1]
                        grade_points_part = parts[title_index + 2]
                        # Handle merged fields (e.g., '4.00 CSE496')
                        if ' ' in grade_points_part:
                            split_parts = re.split(r'\s+', grade_points_part, 1)
                            # Debug: Print merged field splitting
                            print(f"Splitting merged field at index {title_index + 2}: {grade_points_part} -> {split_parts}")
                            if len(split_parts) == 2:
                                grade_points, next_part = split_parts
                                parts[title_index + 2] = grade_points  # Update current part
                                if next_part and any(next_part.startswith(prefix) for prefix in ('CSE', 'ENG', 'MAT', 'PHY', 'STA', 'BNG', 'EMB', 'HUM', 'CHE', 'ECO', 'SOC', 'ANT', 'BIO')):
                                    parts.insert(title_index + 3, next_part)  # Reinsert course code
                                    i = title_index + 2  # Move to reinserted course code
                                else:
                                    i = title_index + 3  # Move to next potential course
                            else:
                                grade_points = grade_points_part
                                i = title_index + 3  # Move to next potential course
                        else:
                            grade_points = grade_points_part
                            i = title_index + 3  # Move to next potential course
                        float(grade_points)  # Verify grade points
                        if '(NT)' not in grade:
                            if '(RP)' or '(RT)' in grade:
                                grade = grade[:3].strip('(').strip()
                            courses_data.append({
                                "code": course_no,
                                "name": course_title,
                                "credit": credits_earned,
                                "grade": grade
                            })
                    else:
                        print(f"Not enough parts for course at index {i}: {parts[i:]}")
                        i += 1
                except (ValueError, IndexError):
                    print(f"Skipping invalid entry at index {i}: {parts[i:i+6]}")
                    i += 1  # Skip invalid entry
            else:
                print(f"Not enough parts at index {i}: {parts[i:]}")
                i += 1  # Skip if not enough parts
        else:
            i += 1  # Skip non-course parts
    
    return courses_data