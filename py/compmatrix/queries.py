import sqlite3
from typing import List

from sqlalchemy import create_engine, func, distinct
from sqlalchemy.orm import aliased, sessionmaker

from py.compmatrix.schema import App, AppSdk, Sdk

def connect():
    return sqlite3.connect('data.db', check_same_thread=False)

engine = create_engine("sqlite://", creator=connect, echo=True, future=True)
Session = sessionmaker(bind=engine)
session = Session()

T1 = aliased(AppSdk)
T2 = aliased(AppSdk)
Sdk1 = aliased(Sdk)
Sdk2 = aliased(Sdk)

root_query = (
    session
    .query(T1, T2, Sdk1, Sdk2, func.count(distinct(T1.app_id)))
    .filter(
        T1.app_id == T2.app_id,
        T1.sdk_id == Sdk1.id,
        T2.sdk_id == Sdk2.id,
        T1.installed == False,
        T2.installed == True,
    )
)

def get_churn_between_sdks(sdk_choice: List[str]):
    return (
        root_query
        .filter(
            Sdk1.slug.in_(sdk_choice),
            Sdk2.slug.in_(sdk_choice)
        )
        .group_by(Sdk1.id, Sdk2.id)
    ).all()

def get_churn_from_none(sdk_choice: List[str]):
  return (
    root_query
    .filter(
        Sdk1.slug.not_in(sdk_choice),
        Sdk2.slug.in_(sdk_choice)
    )
    .group_by(Sdk2.id)
    ).all()

def get_churn_to_none(sdk_choice: List[str]):
  return (
    root_query
    .filter(
        Sdk1.slug.in_(sdk_choice),
        Sdk2.slug.not_in(sdk_choice)
    )
    .group_by(Sdk1.id)
    ).all()

def get_sdk_totals(sdk_choice: List[str]):
  return (
    session
    .query(func.count(distinct(AppSdk.app_id)), AppSdk, Sdk)
    .filter(
        AppSdk.sdk_id==Sdk.id,
        AppSdk.installed == True,
        Sdk.slug.in_(sdk_choice)
    )
    .group_by(Sdk.id)
    ).all()

def get_not_involved(sdk_choice: List[str]):
  return (
    session
    .query(func.count(App.id))
    .filter(
        ~session
        .query(AppSdk, Sdk)
        .filter(
            AppSdk.sdk_id == Sdk.id ,
            Sdk.slug.in_(sdk_choice),
            AppSdk.installed == 1 ,
            AppSdk.app_id == App.id
        )
        .exists()
    )
    ).all()

def get_sdks():
  return session.query(Sdk).all()

# Below: queries to get example apps

def get_churn_examples_between_sdks(slug1: str, slug2: str):
    return (
        session
        .query(T1, T2, Sdk1, Sdk2, App)
        .filter(
            T1.app_id == T2.app_id,
            T1.sdk_id == Sdk1.id,
            T2.sdk_id == Sdk2.id,
            T1.installed == False,
            T2.installed == True,
            Sdk1.slug == slug1,
            Sdk2.slug == slug2,
            App.id == T1.app_id
        )
        .limit(5)
        .all()
    )

def get_churn_examples_from_none(slug: str, sdk_choice: List[str]):
    return (
        session
        .query(T1, T2, Sdk1, Sdk2, App)
        .filter(
            T1.app_id == T2.app_id,
            T1.sdk_id == Sdk1.id,
            T2.sdk_id == Sdk2.id,
            T1.installed == False,
            T2.installed == True,
            Sdk1.slug.not_in(sdk_choice),
            Sdk2.slug == slug,
            App.id == T1.app_id

        )
        .limit(5)
        .all()
    )

def get_churn_examples_to_none(slug: str, sdk_choice: List[str]):
    return (
        session
        .query(T1, T2, Sdk1, Sdk2, App)
        .filter(
            T1.app_id == T2.app_id,
            T1.sdk_id == Sdk1.id,
            T2.sdk_id == Sdk2.id,
            T1.installed == False,
            T2.installed == True,
            Sdk1.slug == slug,
            Sdk2.slug.not_in(sdk_choice),
            App.id == T1.app_id
        )
        .limit(5)
        .all()
    )


def get_examples_for_sdk(slug):
    return (
        session
        .query(AppSdk, Sdk, App)
        .filter(
            AppSdk.sdk_id == Sdk.id,
            AppSdk.installed == True,
            Sdk.slug == slug,
            AppSdk.app_id == App.id
        )
        .limit(5)
    ).all()

def get_examples_not_involved(sdk_choice):
    return (
        session
        .query(App)
        .filter(
            ~session
            .query(AppSdk, Sdk)
            .filter(
                AppSdk.sdk_id == Sdk.id ,
                Sdk.slug.in_(sdk_choice),
                AppSdk.installed == 1 ,
                AppSdk.app_id == App.id
            )
            .exists()
        )
        .limit(5)
    ).all()
