from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base


Base = declarative_base()


class App(Base):
    __tablename__ = 'app'
    id = Column(Integer, primary_key=True)
    name = Column(String)


class Sdk(Base):
    __tablename__ = 'sdk'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    slug = Column(String)


class AppSdk(Base):
    __tablename__ = 'app_sdk'
    app_id = Column(Integer, ForeignKey("app.id"), primary_key=True)
    sdk_id = Column(Integer, ForeignKey("sdk.id"), primary_key=True)
    installed = Column(Boolean)

