"""
Database models for crop analysis system
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class Field(db.Model):
    """Field model - stores field polygons"""
    __tablename__ = 'fields'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    crop_type = db.Column(db.String(100))
    polygon_coordinates = db.Column(db.Text, nullable=False)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Agricultural details
    soil_type = db.Column(db.String(100))        # e.g. clay, sandy, loam, silt
    soil_treatment = db.Column(db.String(200))    # e.g. liming, fertilization, none
    planting_date = db.Column(db.String(20))      # ISO date string
    irrigation_type = db.Column(db.String(100))   # e.g. drip, sprinkler, rain-fed, pivot
    plant_spacing = db.Column(db.String(50))      # e.g. "3x1.5m"
    estimated_plants = db.Column(db.Integer)
    notes = db.Column(db.Text)

    # Relationship
    spots = db.relationship('Spot', backref='field', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'crop_type': self.crop_type,
            'polygon_coordinates': json.loads(self.polygon_coordinates),
            'spot_count': len(self.spots),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'soil_type': self.soil_type,
            'soil_treatment': self.soil_treatment,
            'planting_date': self.planting_date,
            'irrigation_type': self.irrigation_type,
            'plant_spacing': self.plant_spacing,
            'estimated_plants': self.estimated_plants,
            'notes': self.notes,
        }
    
    def get_polygon_coords(self):
        """Get polygon coordinates as list"""
        return json.loads(self.polygon_coordinates)


class Spot(db.Model):
    """Spot model - stores GPS locations where images were taken"""
    __tablename__ = 'spots'
    
    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(db.Integer, db.ForeignKey('fields.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    image_path = db.Column(db.String(500))
    image_filename = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    device = db.Column(db.String(100))
    notes = db.Column(db.Text)
    
    # Relationship
    analysis = db.relationship('AnalysisResult', backref='spot', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self, include_analysis=True):
        """Convert to dictionary for JSON serialization"""
        result = {
            'id': self.id,
            'field_id': self.field_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'device': self.device,
            'notes': self.notes,
            'image_filename': self.image_filename
        }
        
        if include_analysis and self.analysis:
            result['analysis'] = self.analysis.to_dict()
        
        return result


class AnalysisResult(db.Model):
    """Analysis result model - stores AI model analysis results"""
    __tablename__ = 'analysis_results'
    
    id = db.Column(db.Integer, primary_key=True)
    spot_id = db.Column(db.Integer, db.ForeignKey('spots.id'), nullable=False, unique=True)
    model_version = db.Column(db.String(50))
    status = db.Column(db.String(50), nullable=False)  # 'ok' or 'unusable_image'
    health_label = db.Column(db.String(50))  # 'healthy', 'diseased', etc.
    confidence = db.Column(db.Float)
    diseases_detected = db.Column(db.Text)  # JSON array
    pests_detected = db.Column(db.Text)  # JSON array
    nutrient_deficiencies_detected = db.Column(db.Text)  # JSON array
    stress_signs = db.Column(db.Text)  # JSON array
    image_quality_is_blurry = db.Column(db.Boolean)
    image_quality_is_underexposed = db.Column(db.Boolean)
    image_quality_is_overexposed = db.Column(db.Boolean)
    processing_time_ms = db.Column(db.Integer)
    analyzed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'model_version': self.model_version,
            'status': self.status,
            'health_assessment': {
                'label': self.health_label,
                'confidence': self.confidence
            },
            'detailed_findings': {
                'diseases_detected': json.loads(self.diseases_detected) if self.diseases_detected else [],
                'pests_detected': json.loads(self.pests_detected) if self.pests_detected else [],
                'nutrient_deficiencies_detected': json.loads(self.nutrient_deficiencies_detected) if self.nutrient_deficiencies_detected else [],
                'stress_signs': json.loads(self.stress_signs) if self.stress_signs else []
            },
            'image_quality': {
                'is_blurry': self.image_quality_is_blurry,
                'is_underexposed': self.image_quality_is_underexposed,
                'is_overexposed': self.image_quality_is_overexposed
            },
            'processing_time_ms': self.processing_time_ms,
            'analyzed_at': self.analyzed_at.isoformat() if self.analyzed_at else None
        }


class VideoAnalysis(db.Model):
    """Persisted annotated video produced by /api/analyze-video.

    Stored on disk under uploads/videos/ (git-ignored) so analyzed videos
    survive restarts and show up on the gestor dashboard.
    """
    __tablename__ = 'video_analyses'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(64))
    original_filename = db.Column(db.String(300))
    stored_path = db.Column(db.String(500), nullable=False)
    total_detections = db.Column(db.Integer, default=0)
    frames_analyzed = db.Column(db.Integer, default=0)
    total_frames = db.Column(db.Integer, default=0)
    classes = db.Column(db.Text)  # JSON object {class: count}
    model_version = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.original_filename,
            'url': f'/api/videos/{self.id}/file',
            'stats': {
                'totalDetections': self.total_detections,
                'framesAnalyzed': self.frames_analyzed,
                'totalFrames': self.total_frames,
                'classes': json.loads(self.classes) if self.classes else {},
            },
            'model': self.model_version,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

